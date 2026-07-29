import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/firebase/firebase'
import { removeUndefined } from '@/utils/removeUndefined'
import { getEffectiveSubscriptionStatus, formatDate, formatCurrency } from '@/utils/helpers'
import { getSubscriptionPlanById } from '@/services/subscriptionService'
import { getUserById } from '@/services/userService'
import { getProfileById } from '@/services/profileService'
import { logActivity } from '@/services/activityLogService'

const SUBSCRIPTIONS_COLLECTION = 'subscriptions'

export function generateSubscriptionId() {
  return doc(collection(db, SUBSCRIPTIONS_COLLECTION)).id
}

function mapSnapshot(snapshot) {
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
}

/**
 * Subscriptions scale with the user base (same order of magnitude as
 * Users/Profiles), so — unlike Subscription Plans — this isn't small
 * catalog data. Even so, no pagination was requested for this module
 * (unlike Users/Profiles, which explicitly asked for it), so this
 * subscribes to the whole collection like Subscription Plans does. If this
 * collection grows very large, the natural upgrade is the same cursor
 * pagination pattern already used by useUsers.js/useProfiles.js.
 */
export function subscribeToSubscriptions(onData, onError) {
  return onSnapshot(collection(db, SUBSCRIPTIONS_COLLECTION), (snapshot) => onData(mapSnapshot(snapshot)), onError)
}

export async function getSubscriptionById(subscriptionId) {
  const snap = await getDoc(doc(db, SUBSCRIPTIONS_COLLECTION, subscriptionId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

/** All subscription documents ever created for a user, newest first — powers SubscriptionHistory.jsx. */
export async function getSubscriptionHistoryForUser(userId, excludeId) {
  const historyQuery = query(collection(db, SUBSCRIPTIONS_COLLECTION), where('userId', '==', userId))
  const snapshot = await getDocs(historyQuery)
  return mapSnapshot(snapshot)
    .filter((sub) => sub.id !== excludeId)
    .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
}

/** True if this user already has a subscription whose *effective* status is active. */
export async function hasActiveSubscription(userId) {
  const existingQuery = query(collection(db, SUBSCRIPTIONS_COLLECTION), where('userId', '==', userId))
  const snapshot = await getDocs(existingQuery)
  return mapSnapshot(snapshot).some((sub) => getEffectiveSubscriptionStatus(sub) === 'active')
}

/** All of a user's subscriptions, newest first — used by Add Payment's
 * "select which subscription this payment is for" picker. */
export async function getSubscriptionsForUser(userId) {
  const userQuery = query(collection(db, SUBSCRIPTIONS_COLLECTION), where('userId', '==', userId))
  const snapshot = await getDocs(userQuery)
  return mapSnapshot(snapshot).sort(
    (a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)
  )
}

/**
 * Called by paymentService.js when a payment's status changes — keeps the
 * subscription's paymentId/paymentStatus in sync, and per the module spec,
 * activates the subscription when a payment succeeds. Lives here (not in
 * paymentService.js) because this file owns all writes to `subscriptions`,
 * the same collection-ownership convention used throughout this app.
 */
export async function updateSubscriptionPaymentLink(subscriptionId, { paymentId, paymentStatus, activate }) {
  const payload = {
    paymentId,
    paymentStatus,
    updatedAt: serverTimestamp(),
  }
  if (activate) payload.status = 'active'
  await updateDoc(doc(db, SUBSCRIPTIONS_COLLECTION, subscriptionId), removeUndefined(payload))
}

function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Creates a new subscription, enforcing every rule from the module spec:
 * the plan must be active, the user must not be blocked/deleted, the
 * profile must not be deleted, and the user can't already have an
 * effectively-active subscription. Re-validated here (not just in the UI)
 * since this is the actual write boundary.
 */
export async function assignSubscription({ userId, profileId, planId, admin, startDate }) {
  const adminLabel = admin?.name || admin?.email || 'Admin'
  const [plan, user, profile] = await Promise.all([
    getSubscriptionPlanById(planId),
    getUserById(userId),
    getProfileById(profileId),
  ])

  if (!plan || plan.status !== 'active') {
    throw new Error('This plan is not active and cannot be assigned.')
  }
  if (!user || user.status === 'deleted') {
    throw new Error('This user no longer exists.')
  }
  if (user.status === 'blocked') {
    throw new Error('Blocked users cannot be assigned a subscription.')
  }
  if (!profile || profile.system?.status === 'deleted') {
    throw new Error('This profile no longer exists.')
  }
  if (await hasActiveSubscription(userId)) {
    throw new Error('This user already has an active subscription.')
  }

  const subscriptionId = generateSubscriptionId()
  const effectiveStartDate = startDate ? new Date(startDate) : new Date()
  const expiryDate = addDays(effectiveStartDate, Number(plan.durationDays))
  const now = Timestamp.now()

  const payload = {
    subscriptionId,
    userId,
    profileId,
    planId,
    planName: plan.planName,
    amount: Number(plan.price),
    purchaseDate: Timestamp.fromDate(effectiveStartDate),
    startDate: Timestamp.fromDate(effectiveStartDate),
    expiryDate: Timestamp.fromDate(expiryDate),
    status: 'active',
    paymentStatus: 'pending',
    paymentId: null,
    createdBy: adminLabel,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    timeline: [
      { event: 'created', date: now },
      { event: 'activated', date: now },
    ],
  }

  await setDoc(doc(db, SUBSCRIPTIONS_COLLECTION, subscriptionId), removeUndefined(payload))

  logActivity({
    action: 'assign_subscription',
    module: 'User Subscriptions',
    targetType: 'subscription',
    targetId: subscriptionId,
    description: `Assigned ${plan.planName} to ${user.name || 'a user'}`,
    newData: { planId, planName: plan.planName, userId },
    admin,
  })

  return subscriptionId
}

/**
 * Renews a subscription — same plan or a different one — always by mutating
 * the existing document rather than creating a new one. That's deliberate:
 * with "no duplicate active subscriptions per user" as a hard rule, having
 * exactly one live document per user's subscription lifecycle avoids ever
 * having two "active-looking" docs at once. Full history of what changed
 * lives in the `timeline` array (and activityLogs), not in separate docs.
 */
export async function renewSubscription(subscriptionId, { planId, admin }) {
  const subscription = await getSubscriptionById(subscriptionId)
  if (!subscription) throw new Error('Subscription not found.')

  const plan = await getSubscriptionPlanById(planId)
  if (!plan || plan.status !== 'active') {
    throw new Error('This plan is not active and cannot be used to renew.')
  }

  const startDate = new Date()
  const expiryDate = addDays(startDate, Number(plan.durationDays))
  const planChanged = planId !== subscription.planId
  const now = Timestamp.now()

  await updateDoc(doc(db, SUBSCRIPTIONS_COLLECTION, subscriptionId), {
    planId,
    planName: plan.planName,
    amount: Number(plan.price),
    purchaseDate: Timestamp.fromDate(startDate),
    startDate: Timestamp.fromDate(startDate),
    expiryDate: Timestamp.fromDate(expiryDate),
    status: 'active',
    updatedAt: serverTimestamp(),
    timeline: [...(subscription.timeline || []), { event: 'renewed', date: now }],
  })

  logActivity({
    action: 'renew_subscription',
    module: 'User Subscriptions',
    targetType: 'subscription',
    targetId: subscriptionId,
    description: planChanged
      ? `Renewed subscription with a new plan (${plan.planName})`
      : `Renewed subscription (${plan.planName})`,
    oldData: { planId: subscription.planId, planName: subscription.planName, expiryDate: subscription.expiryDate },
    newData: { planId, planName: plan.planName, expiryDate: Timestamp.fromDate(expiryDate) },
    admin,
  })
}

/**
 * Adds a fixed number of days to the expiry date — extending from whichever
 * is later, the current expiry or today, so extending an already-expired
 * subscription doesn't land the new expiry date in the past again.
 */
export async function extendSubscription(subscriptionId, { days, admin }) {
  const subscription = await getSubscriptionById(subscriptionId)
  if (!subscription) throw new Error('Subscription not found.')
  if (getEffectiveSubscriptionStatus(subscription) === 'cancelled') {
    throw new Error('Cannot extend a cancelled subscription.')
  }

  const currentExpiry = subscription.expiryDate?.toDate?.() || new Date()
  const base = currentExpiry.getTime() > Date.now() ? currentExpiry : new Date()
  const newExpiryDate = addDays(base, Number(days))
  const now = Timestamp.now()

  await updateDoc(doc(db, SUBSCRIPTIONS_COLLECTION, subscriptionId), {
    expiryDate: Timestamp.fromDate(newExpiryDate),
    status: 'active',
    updatedAt: serverTimestamp(),
    timeline: [...(subscription.timeline || []), { event: 'extended', date: now, note: `+${days} days` }],
  })

  logActivity({
    action: 'extend_subscription',
    module: 'User Subscriptions',
    targetType: 'subscription',
    targetId: subscriptionId,
    description: `Extended subscription by ${days} days`,
    oldData: { expiryDate: subscription.expiryDate },
    newData: { expiryDate: Timestamp.fromDate(newExpiryDate) },
    admin,
  })
}

/** Cancel only ever changes status — the document and its history are kept forever. */
export async function cancelSubscription(subscriptionId, { admin }) {
  const subscription = await getSubscriptionById(subscriptionId)
  if (!subscription) throw new Error('Subscription not found.')

  const now = Timestamp.now()
  await updateDoc(doc(db, SUBSCRIPTIONS_COLLECTION, subscriptionId), {
    status: 'cancelled',
    updatedAt: serverTimestamp(),
    timeline: [...(subscription.timeline || []), { event: 'cancelled', date: now }],
  })

  logActivity({
    action: 'cancel_subscription',
    module: 'User Subscriptions',
    targetType: 'subscription',
    targetId: subscriptionId,
    description: 'Cancelled subscription',
    oldData: { status: subscription.status },
    newData: { status: 'cancelled' },
    admin,
  })
}

const EXPORT_COLUMNS = [
  { key: 'subscriptionId', label: 'Subscription ID' },
  { key: 'userId', label: 'User ID' },
  { key: 'profileId', label: 'Profile ID' },
  { key: 'planName', label: 'Plan' },
  { key: 'amount', label: 'Amount' },
  { key: 'purchaseDate', label: 'Purchase Date' },
  { key: 'expiryDate', label: 'Expiry Date' },
  { key: 'status', label: 'Status' },
  { key: 'paymentStatus', label: 'Payment Status' },
]

function toExportRows(subscriptions) {
  return subscriptions.map((sub) => ({
    subscriptionId: sub.id,
    userId: sub.userId || '',
    profileId: sub.profileId || '',
    planName: sub.planName || '',
    amount: formatCurrency(sub.amount),
    purchaseDate: formatDate(sub.purchaseDate),
    expiryDate: formatDate(sub.expiryDate),
    status: getEffectiveSubscriptionStatus(sub),
    paymentStatus: sub.paymentStatus || '',
  }))
}

function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function escapeCsvCell(value) {
  return `"${String(value).replace(/"/g, '""')}"`
}

export function exportSubscriptionsToCsv(subscriptions) {
  const rows = toExportRows(subscriptions)
  const header = EXPORT_COLUMNS.map((col) => escapeCsvCell(col.label)).join(',')
  const body = rows
    .map((row) => EXPORT_COLUMNS.map((col) => escapeCsvCell(row[col.key])).join(','))
    .join('\n')
  downloadBlob(`${header}\n${body}`, 'subscriptions.csv', 'text/csv;charset=utf-8;')
}

function escapeHtml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Same dependency-free HTML-table-as-.xls technique used by userService.js
// — deliberately avoids the vulnerable npm `xlsx` package. See userService.js
// for the full rationale.
export function exportSubscriptionsToExcel(subscriptions) {
  const rows = toExportRows(subscriptions)
  const headerRow = `<tr>${EXPORT_COLUMNS.map((col) => `<th>${escapeHtml(col.label)}</th>`).join('')}</tr>`
  const bodyRows = rows
    .map(
      (row) =>
        `<tr>${EXPORT_COLUMNS.map((col) => `<td>${escapeHtml(row[col.key])}</td>`).join('')}</tr>`
    )
    .join('')
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8" /></head>
<body><table>${headerRow}${bodyRows}</table></body>
</html>`
  downloadBlob(html, 'subscriptions.xls', 'application/vnd.ms-excel')
}
