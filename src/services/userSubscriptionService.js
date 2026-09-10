import api from '@/lib/api'
import { removeUndefined } from '@/utils/removeUndefined'
import { getEffectiveSubscriptionStatus, formatDate, formatCurrency } from '@/utils/helpers'
import { getSubscriptionPlanById } from '@/services/subscriptionService'
import { getUserById } from '@/services/userService'
import { getProfileById } from '@/services/profileService'
import { logActivity } from '@/services/activityLogService'

export function generateSubscriptionId() {
  return `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
}

function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function subscribeToSubscriptions(onData, onError) {
  let isCancelled = false

  async function fetchSubscriptions() {
    try {
      const response = await api.get('/user-subscriptions', { limit: 2000 })
      const list = Array.isArray(response)
        ? response
        : (response?.subscriptions || response?.data || [])
      if (!isCancelled) onData(list)
    } catch (err) {
      if (!isCancelled && onError) onError(err)
    }
  }

  fetchSubscriptions()

  return () => {
    isCancelled = true
  }
}

export async function getSubscriptionById(subscriptionId) {
  const response = await api.get(`/user-subscriptions/${subscriptionId}`)
  return response?.subscription || response?.data || response
}

export async function getSubscriptionHistoryForUser(userId, excludeId) {
  const response = await api.get('/user-subscriptions', { userId })
  const list = Array.isArray(response) ? response : (response?.subscriptions || response?.data || [])
  return list
    .filter((sub) => sub.id !== excludeId && sub.subscriptionId !== excludeId)
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
}

export async function hasActiveSubscription(userId) {
  try {
    const response = await api.get('/user-subscriptions', { userId })
    const list = Array.isArray(response) ? response : (response?.subscriptions || response?.data || [])
    return list.some((sub) => getEffectiveSubscriptionStatus(sub) === 'active')
  } catch {
    return false
  }
}

export async function getSubscriptionsForUser(userId) {
  const response = await api.get('/user-subscriptions', { userId })
  const list = Array.isArray(response) ? response : (response?.subscriptions || response?.data || [])
  return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
}

export async function updateSubscriptionPaymentLink(subscriptionId, { paymentId, paymentStatus, activate }) {
  const payload = removeUndefined({
    paymentId,
    paymentStatus,
    updatedAt: new Date().toISOString(),
    ...(activate && { status: 'active' }),
  })
  await api.patch(`/user-subscriptions/${subscriptionId}/payment`, payload).catch(async () => {
    await api.put(`/user-subscriptions/${subscriptionId}`, payload)
  })
}

export async function assignSubscription({ userId, profileId, planId, admin, startDate }) {
  const adminLabel = admin?.name || admin?.email || 'Admin'
  const [plan, user] = await Promise.all([
    getSubscriptionPlanById(planId),
    getUserById(userId),
    profileId ? getProfileById(profileId).catch(() => null) : Promise.resolve(null),
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
  if (await hasActiveSubscription(userId)) {
    throw new Error('This user already has an active subscription.')
  }

  const subscriptionId = generateSubscriptionId()
  const effectiveStartDate = startDate ? new Date(startDate) : new Date()
  const expiryDate = addDays(effectiveStartDate, Number(plan.durationDays))
  const now = new Date().toISOString()

  const payload = removeUndefined({
    id: subscriptionId,
    subscriptionId,
    userId,
    profileId: profileId || null,
    planId,
    planName: plan.planName,
    amount: Number(plan.price),
    purchaseDate: effectiveStartDate.toISOString(),
    startDate: effectiveStartDate.toISOString(),
    expiryDate: expiryDate.toISOString(),
    status: 'active',
    paymentStatus: 'pending',
    paymentId: null,
    createdBy: adminLabel,
    createdAt: now,
    updatedAt: now,
    timeline: [
      { event: 'created', date: now },
      { event: 'activated', date: now },
    ],
  })

  await api.post('/user-subscriptions', payload)

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
  const now = new Date().toISOString()

  const payload = {
    planId,
    planName: plan.planName,
    amount: Number(plan.price),
    purchaseDate: startDate.toISOString(),
    startDate: startDate.toISOString(),
    expiryDate: expiryDate.toISOString(),
    status: 'active',
    updatedAt: now,
    timeline: [...(subscription.timeline || []), { event: 'renewed', date: now }],
  }

  await api.put(`/user-subscriptions/${subscriptionId}/renew`, payload).catch(async () => {
    await api.put(`/user-subscriptions/${subscriptionId}`, payload)
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
    newData: { planId, planName: plan.planName, expiryDate: expiryDate.toISOString() },
    admin,
  })
}

export async function extendSubscription(subscriptionId, { days, admin }) {
  const subscription = await getSubscriptionById(subscriptionId)
  if (!subscription) throw new Error('Subscription not found.')
  if (getEffectiveSubscriptionStatus(subscription) === 'cancelled') {
    throw new Error('Cannot extend a cancelled subscription.')
  }

  const currentExpiry = subscription.expiryDate ? new Date(subscription.expiryDate) : new Date()
  const base = currentExpiry.getTime() > Date.now() ? currentExpiry : new Date()
  const newExpiryDate = addDays(base, Number(days))
  const now = new Date().toISOString()

  const payload = {
    expiryDate: newExpiryDate.toISOString(),
    status: 'active',
    updatedAt: now,
    timeline: [...(subscription.timeline || []), { event: 'extended', date: now, note: `+${days} days` }],
  }

  await api.put(`/user-subscriptions/${subscriptionId}/extend`, payload).catch(async () => {
    await api.put(`/user-subscriptions/${subscriptionId}`, payload)
  })

  logActivity({
    action: 'extend_subscription',
    module: 'User Subscriptions',
    targetType: 'subscription',
    targetId: subscriptionId,
    description: `Extended subscription by ${days} days`,
    oldData: { expiryDate: subscription.expiryDate },
    newData: { expiryDate: newExpiryDate.toISOString() },
    admin,
  })
}

export async function cancelSubscription(subscriptionId, { admin }) {
  const subscription = await getSubscriptionById(subscriptionId)
  if (!subscription) throw new Error('Subscription not found.')

  const now = new Date().toISOString()
  const payload = {
    status: 'cancelled',
    updatedAt: now,
    timeline: [...(subscription.timeline || []), { event: 'cancelled', date: now }],
  }

  await api.put(`/user-subscriptions/${subscriptionId}/cancel`, payload).catch(async () => {
    await api.put(`/user-subscriptions/${subscriptionId}`, payload)
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
    subscriptionId: sub.id || sub.subscriptionId,
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
