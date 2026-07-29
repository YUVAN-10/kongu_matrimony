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
import { formatCurrency, formatDate } from '@/utils/helpers'
import { logActivity } from '@/services/activityLogService'
import { updateSubscriptionPaymentLink } from '@/services/userSubscriptionService'

/**
 * This module records payments — it does not process them. There is no
 * live gateway integration here by design (none was requested). The
 * `gateway`/`gatewayReference` fields and the status machine below exist
 * so that plugging in a real processor (Razorpay, PhonePe, Stripe, ...)
 * later is additive, not a redesign: a webhook handler would call the same
 * markPaymentSuccess/markPaymentFailed functions this UI calls manually,
 * using `gatewayReference` to look up which payment it's for.
 */
const PAYMENTS_COLLECTION = 'payments'

export function generatePaymentId() {
  return doc(collection(db, PAYMENTS_COLLECTION)).id
}

function mapSnapshot(snapshot) {
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
}

/** Realtime, whole-collection subscription — see userSubscriptionService.js's
 * equivalent comment for why (no pagination requested for this module). */
export function subscribeToPayments(onData, onError) {
  return onSnapshot(collection(db, PAYMENTS_COLLECTION), (snapshot) => onData(mapSnapshot(snapshot)), onError)
}

export async function getPaymentById(paymentId) {
  const snap = await getDoc(doc(db, PAYMENTS_COLLECTION, paymentId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function getPaymentsForSubscription(subscriptionId) {
  const paymentsQuery = query(collection(db, PAYMENTS_COLLECTION), where('subscriptionId', '==', subscriptionId))
  const snapshot = await getDocs(paymentsQuery)
  return mapSnapshot(snapshot).sort(
    (a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)
  )
}

async function assertNoDuplicateSuccessfulPayment(subscriptionId, excludePaymentId) {
  if (!subscriptionId) return
  const existing = await getPaymentsForSubscription(subscriptionId)
  const hasSuccess = existing.some((payment) => payment.status === 'success' && payment.id !== excludePaymentId)
  if (hasSuccess) {
    throw new Error('A successful payment already exists for this subscription.')
  }
}

/**
 * Records a new payment. `status` is whatever the admin chose on the Add
 * Payment form (pending/success/failed/cancelled — never "refunded" at
 * creation, see CREATABLE_PAYMENT_STATUS_OPTIONS). Only a "success" status
 * syncs the linked subscription — per the module spec, a failed payment
 * leaves the subscription's paymentStatus exactly as it was (still Pending).
 */
export async function createPayment(data, { admin }) {
  const adminLabel = admin?.name || admin?.email || 'Admin'
  const amount = Number(data.amount)
  if (!(amount > 0)) {
    throw new Error('Amount must be greater than zero.')
  }
  if (data.status === 'success') {
    await assertNoDuplicateSuccessfulPayment(data.subscriptionId)
  }

  const paymentId = generatePaymentId()
  const now = Timestamp.now()
  const paymentDate = data.paymentDate ? Timestamp.fromDate(new Date(data.paymentDate)) : now

  const payload = {
    paymentId,
    transactionId: data.transactionId,
    subscriptionId: data.subscriptionId,
    userId: data.userId,
    profileId: data.profileId,
    planId: data.planId,
    planName: data.planName,
    amount,
    currency: data.currency || 'INR',
    paymentMethod: data.paymentMethod,
    gateway: data.gateway || 'Manual',
    status: data.status,
    gatewayReference: data.gatewayReference || null,
    paymentDate,
    remarks: data.remarks || '',
    createdBy: adminLabel,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    timeline: [
      { event: 'created', date: now },
      { event: data.status, date: now },
    ],
  }

  await setDoc(doc(db, PAYMENTS_COLLECTION, paymentId), removeUndefined(payload))

  if (data.status === 'success' && data.subscriptionId) {
    await updateSubscriptionPaymentLink(data.subscriptionId, {
      paymentId,
      paymentStatus: 'paid',
      activate: true,
    })
  }

  await logActivity({
    action: 'create_payment',
    module: 'Payments',
    targetType: 'payment',
    targetId: paymentId,
    description: `Recorded a ${data.status} payment of ${formatCurrency(amount)} (${data.planName})`,
    newData: payload,
    admin,
  })

  return paymentId
}

async function appendTimelineEvent(paymentId, event, extra = {}) {
  const payment = await getPaymentById(paymentId)
  if (!payment) throw new Error('Payment not found.')
  await updateDoc(doc(db, PAYMENTS_COLLECTION, paymentId), {
    ...extra,
    updatedAt: serverTimestamp(),
    timeline: [...(payment.timeline || []), { event, date: Timestamp.now() }],
  })
  return payment
}

export async function markPaymentSuccess(paymentId, { admin }) {
  const payment = await getPaymentById(paymentId)
  if (!payment) throw new Error('Payment not found.')
  if (!['pending', 'failed'].includes(payment.status)) {
    throw new Error(`Cannot mark a ${payment.status} payment as successful.`)
  }
  await assertNoDuplicateSuccessfulPayment(payment.subscriptionId, paymentId)

  await appendTimelineEvent(paymentId, 'success', { status: 'success' })

  if (payment.subscriptionId) {
    await updateSubscriptionPaymentLink(payment.subscriptionId, {
      paymentId,
      paymentStatus: 'paid',
      activate: true,
    })
  }

  await logActivity({
    action: 'update',
    module: 'Payments',
    targetType: 'payment',
    targetId: paymentId,
    description: `Marked payment as successful`,
    oldData: { status: payment.status },
    newData: { status: 'success' },
    admin,
  })
}

export async function markPaymentFailed(paymentId, { admin }) {
  const payment = await getPaymentById(paymentId)
  if (!payment) throw new Error('Payment not found.')
  if (payment.status !== 'pending') {
    throw new Error(`Cannot mark a ${payment.status} payment as failed.`)
  }

  // Deliberately does not touch the linked subscription — per the module
  // spec, a failed payment leaves the subscription's paymentStatus as
  // Pending, exactly as it already was.
  await appendTimelineEvent(paymentId, 'failed', { status: 'failed' })

  await logActivity({
    action: 'update',
    module: 'Payments',
    targetType: 'payment',
    targetId: paymentId,
    description: `Marked payment as failed`,
    oldData: { status: payment.status },
    newData: { status: 'failed' },
    admin,
  })
}

export async function retryPayment(paymentId, { admin }) {
  const payment = await getPaymentById(paymentId)
  if (!payment) throw new Error('Payment not found.')
  if (payment.status !== 'failed') {
    throw new Error('Only a failed payment can be retried.')
  }

  await appendTimelineEvent(paymentId, 'pending', { status: 'pending' })

  await logActivity({
    action: 'update',
    module: 'Payments',
    targetType: 'payment',
    targetId: paymentId,
    description: `Retried payment`,
    oldData: { status: payment.status },
    newData: { status: 'pending' },
    admin,
  })
}

export async function cancelPayment(paymentId, { admin }) {
  const payment = await getPaymentById(paymentId)
  if (!payment) throw new Error('Payment not found.')
  if (!['pending', 'failed'].includes(payment.status)) {
    throw new Error(`Cannot cancel a ${payment.status} payment.`)
  }

  await appendTimelineEvent(paymentId, 'cancelled', { status: 'cancelled' })

  await logActivity({
    action: 'update',
    module: 'Payments',
    targetType: 'payment',
    targetId: paymentId,
    description: `Cancelled payment`,
    oldData: { status: payment.status },
    newData: { status: 'cancelled' },
    admin,
  })
}

/**
 * Refunds only ever come from a successful payment. Per the module spec,
 * refunding does not automatically change the subscription's own status
 * (active/hidden/etc.) — only its paymentStatus is synced to "refunded".
 * Deactivating the subscription itself, if desired, stays a separate,
 * explicit action in the User Subscriptions module.
 */
export async function refundPayment(paymentId, { refundReason, refundDate, admin }) {
  const payment = await getPaymentById(paymentId)
  if (!payment) throw new Error('Payment not found.')
  if (payment.status !== 'success') {
    throw new Error('Only a successful payment can be refunded.')
  }

  const resolvedRefundDate = refundDate ? Timestamp.fromDate(new Date(refundDate)) : Timestamp.now()

  await appendTimelineEvent(paymentId, 'refunded', {
    status: 'refunded',
    refundDate: resolvedRefundDate,
    refundReason: refundReason || '',
  })

  if (payment.subscriptionId) {
    await updateSubscriptionPaymentLink(payment.subscriptionId, {
      paymentId,
      paymentStatus: 'refunded',
      activate: false,
    })
  }

  await logActivity({
    action: 'refund_payment',
    module: 'Payments',
    targetType: 'payment',
    targetId: paymentId,
    description: `Refunded payment`,
    oldData: { status: 'success' },
    newData: { status: 'refunded', refundReason: refundReason || '' },
    admin,
  })
}

const EXPORT_COLUMNS = [
  { key: 'transactionId', label: 'Transaction ID' },
  { key: 'userId', label: 'User ID' },
  { key: 'profileId', label: 'Profile ID' },
  { key: 'planName', label: 'Plan' },
  { key: 'amount', label: 'Amount' },
  { key: 'paymentMethod', label: 'Method' },
  { key: 'gateway', label: 'Gateway' },
  { key: 'paymentDate', label: 'Payment Date' },
  { key: 'status', label: 'Status' },
]

function toExportRows(payments) {
  return payments.map((payment) => ({
    transactionId: payment.transactionId || payment.id,
    userId: payment.userId || '',
    profileId: payment.profileId || '',
    planName: payment.planName || '',
    amount: formatCurrency(payment.amount),
    paymentMethod: payment.paymentMethod || '',
    gateway: payment.gateway || '',
    paymentDate: formatDate(payment.paymentDate),
    status: payment.status || '',
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

export function exportPaymentsToCsv(payments) {
  const rows = toExportRows(payments)
  const header = EXPORT_COLUMNS.map((col) => escapeCsvCell(col.label)).join(',')
  const body = rows.map((row) => EXPORT_COLUMNS.map((col) => escapeCsvCell(row[col.key])).join(',')).join('\n')
  downloadBlob(`${header}\n${body}`, 'payments.csv', 'text/csv;charset=utf-8;')
}

function escapeHtml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Same dependency-free HTML-table-as-.xls technique used elsewhere in this
// app — deliberately avoids the vulnerable npm `xlsx` package.
export function exportPaymentsToExcel(payments) {
  const rows = toExportRows(payments)
  const headerRow = `<tr>${EXPORT_COLUMNS.map((col) => `<th>${escapeHtml(col.label)}</th>`).join('')}</tr>`
  const bodyRows = rows
    .map((row) => `<tr>${EXPORT_COLUMNS.map((col) => `<td>${escapeHtml(row[col.key])}</td>`).join('')}</tr>`)
    .join('')
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8" /></head>
<body><table>${headerRow}${bodyRows}</table></body>
</html>`
  downloadBlob(html, 'payments.xls', 'application/vnd.ms-excel')
}
