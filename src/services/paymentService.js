import api from '@/lib/api'
import { removeUndefined } from '@/utils/removeUndefined'
import { formatCurrency, formatDate } from '@/utils/helpers'
import { logActivity } from '@/services/activityLogService'
import { updateSubscriptionPaymentLink } from '@/services/userSubscriptionService'

export function generatePaymentId() {
  return `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
}

export function subscribeToPayments(onData, onError) {
  let isCancelled = false

  async function fetchPayments() {
    try {
      const response = await api.get('/payments', { limit: 2000 })
      const list = Array.isArray(response)
        ? response
        : (response?.payments || response?.data || [])
      if (!isCancelled) onData(list)
    } catch (err) {
      if (!isCancelled && onError) onError(err)
    }
  }

  fetchPayments()

  return () => {
    isCancelled = true
  }
}

export async function getPaymentById(paymentId) {
  const response = await api.get(`/payments/${paymentId}`)
  return response?.payment || response?.data || response
}

export async function getPaymentsForSubscription(subscriptionId) {
  const response = await api.get('/payments', { subscriptionId })
  const list = Array.isArray(response) ? response : (response?.payments || response?.data || [])
  return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
}

async function assertNoDuplicateSuccessfulPayment(subscriptionId, excludePaymentId) {
  if (!subscriptionId) return
  const existing = await getPaymentsForSubscription(subscriptionId)
  const hasSuccess = existing.some((payment) => payment.status === 'success' && payment.id !== excludePaymentId && payment.paymentId !== excludePaymentId)
  if (hasSuccess) {
    throw new Error('A successful payment already exists for this subscription.')
  }
}

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
  const now = new Date().toISOString()
  const paymentDate = data.paymentDate ? new Date(data.paymentDate).toISOString() : now

  const payload = removeUndefined({
    id: paymentId,
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
    createdAt: now,
    updatedAt: now,
    timeline: [
      { event: 'created', date: now },
      { event: data.status, date: now },
    ],
  })

  await api.post('/payments', payload)

  if (data.status === 'success' && data.subscriptionId) {
    await updateSubscriptionPaymentLink(data.subscriptionId, {
      paymentId,
      paymentStatus: 'paid',
      activate: true,
    }).catch(() => {})
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

export async function markPaymentSuccess(paymentId, { admin }) {
  const payment = await getPaymentById(paymentId)
  if (!payment) throw new Error('Payment not found.')
  if (!['pending', 'failed'].includes(payment.status)) {
    throw new Error(`Cannot mark a ${payment.status} payment as successful.`)
  }
  await assertNoDuplicateSuccessfulPayment(payment.subscriptionId, paymentId)

  const now = new Date().toISOString()
  const payload = {
    status: 'success',
    updatedAt: now,
    timeline: [...(payment.timeline || []), { event: 'success', date: now }],
  }

  await api.put(`/payments/${paymentId}`, payload).catch(async () => {
    await api.patch(`/payments/${paymentId}/success`, payload)
  })

  if (payment.subscriptionId) {
    await updateSubscriptionPaymentLink(payment.subscriptionId, {
      paymentId,
      paymentStatus: 'paid',
      activate: true,
    }).catch(() => {})
  }

  await logActivity({
    action: 'update',
    module: 'Payments',
    targetType: 'payment',
    targetId: paymentId,
    description: 'Marked payment as successful',
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

  const now = new Date().toISOString()
  const payload = {
    status: 'failed',
    updatedAt: now,
    timeline: [...(payment.timeline || []), { event: 'failed', date: now }],
  }

  await api.put(`/payments/${paymentId}`, payload).catch(async () => {
    await api.patch(`/payments/${paymentId}/failed`, payload)
  })

  await logActivity({
    action: 'update',
    module: 'Payments',
    targetType: 'payment',
    targetId: paymentId,
    description: 'Marked payment as failed',
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

  const now = new Date().toISOString()
  const payload = {
    status: 'pending',
    updatedAt: now,
    timeline: [...(payment.timeline || []), { event: 'pending', date: now }],
  }

  await api.put(`/payments/${paymentId}`, payload)

  await logActivity({
    action: 'update',
    module: 'Payments',
    targetType: 'payment',
    targetId: paymentId,
    description: 'Retried payment',
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

  const now = new Date().toISOString()
  const payload = {
    status: 'cancelled',
    updatedAt: now,
    timeline: [...(payment.timeline || []), { event: 'cancelled', date: now }],
  }

  await api.put(`/payments/${paymentId}`, payload)

  await logActivity({
    action: 'update',
    module: 'Payments',
    targetType: 'payment',
    targetId: paymentId,
    description: 'Cancelled payment',
    oldData: { status: payment.status },
    newData: { status: 'cancelled' },
    admin,
  })
}

export async function refundPayment(paymentId, { refundReason, refundDate, admin }) {
  const payment = await getPaymentById(paymentId)
  if (!payment) throw new Error('Payment not found.')
  if (payment.status !== 'success') {
    throw new Error('Only a successful payment can be refunded.')
  }

  const now = new Date().toISOString()
  const resolvedRefundDate = refundDate ? new Date(refundDate).toISOString() : now

  const payload = {
    status: 'refunded',
    refundDate: resolvedRefundDate,
    refundReason: refundReason || '',
    updatedAt: now,
    timeline: [...(payment.timeline || []), { event: 'refunded', date: now }],
  }

  await api.put(`/payments/${paymentId}`, payload)

  if (payment.subscriptionId) {
    await updateSubscriptionPaymentLink(payment.subscriptionId, {
      paymentId,
      paymentStatus: 'refunded',
      activate: false,
    }).catch(() => {})
  }

  await logActivity({
    action: 'refund_payment',
    module: 'Payments',
    targetType: 'payment',
    targetId: paymentId,
    description: 'Refunded payment',
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
    transactionId: payment.transactionId || '',
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
