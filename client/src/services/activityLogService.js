import api from '@/lib/api'
import { removeUndefined } from '@/utils/removeUndefined'

export function generateActivityLogId() {
  return `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export function subscribeToActivityLogs(onData, onError) {
  let isCancelled = false

  async function fetchLogs() {
    try {
      const response = await api.get('/activity-logs', { limit: 2000 })
      const logs = Array.isArray(response) ? response : (response?.data || response?.logs || [])
      if (!isCancelled) onData(logs)
    } catch (err) {
      if (!isCancelled && onError) onError(err)
    }
  }

  fetchLogs()

  return () => {
    isCancelled = true
  }
}

export async function getActivityLogById(logId) {
  const response = await api.get(`/activity-logs/${logId}`)
  return response?.data || response
}

export async function getActivityLogsForTarget(targetType, targetId) {
  const response = await api.get('/activity-logs', { targetType, targetId, limit: 500 })
  const logs = Array.isArray(response) ? response : (response?.data || response?.logs || [])
  return logs.filter((log) => log.targetType === targetType && log.targetId === targetId)
}

export function getAdminIdentity(admin) {
  return {
    adminId: admin?.uid || admin?.id || 'admin',
    adminName: admin?.name || admin?.fullName || admin?.email || 'Admin',
    adminRole: admin?.role || 'admin',
  }
}

function detectDevice() {
  if (typeof navigator === 'undefined') return 'Unknown'
  const ua = navigator.userAgent || ''
  if (/Tablet|iPad/i.test(ua)) return 'Tablet'
  if (/Mobi|Android/i.test(ua)) return 'Mobile'
  return 'Desktop'
}

function detectBrowser() {
  if (typeof navigator === 'undefined') return 'Unknown'
  const ua = navigator.userAgent || ''
  if (ua.includes('Edg/')) return 'Edge'
  if (ua.includes('Firefox/')) return 'Firefox'
  if (ua.includes('Chrome/') && !ua.includes('Chromium') && !ua.includes('Edg/')) return 'Chrome'
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari'
  return 'Unknown'
}

const DUPLICATE_WINDOW_MS = 4000
const recentLogKeys = new Map()

function pruneOldKeys(now) {
  for (const [key, timestamp] of recentLogKeys) {
    if (now - timestamp > DUPLICATE_WINDOW_MS) recentLogKeys.delete(key)
  }
}

export async function logActivity({
  action,
  module,
  targetType,
  targetId,
  description,
  oldData,
  newData,
  admin,
}) {
  const { adminId, adminName, adminRole } = getAdminIdentity(admin)

  const now = Date.now()
  pruneOldKeys(now)
  const dedupeKey = `${adminId}|${action}|${targetId || ''}`
  if (recentLogKeys.has(dedupeKey)) return
  recentLogKeys.set(dedupeKey, now)

  try {
    const logId = generateActivityLogId()
    const payload = removeUndefined({
      logId,
      action,
      module,
      targetType: targetType ?? null,
      targetId: targetId ?? null,
      adminId,
      adminName,
      adminRole,
      description,
      oldData: oldData ?? null,
      newData: newData ?? null,
      ipAddress: null,
      device: detectDevice(),
      browser: detectBrowser(),
      createdAt: new Date().toISOString(),
    })

    await api.post('/activity-logs', payload).catch(() => {})
  } catch (error) {
    console.error('[activityLogService] Failed to write activity log (non-blocking):', error)
  }
}

const EXPORT_COLUMNS = [
  { key: 'createdAt', label: 'Date & Time' },
  { key: 'adminName', label: 'Admin' },
  { key: 'module', label: 'Module' },
  { key: 'action', label: 'Action' },
  { key: 'targetType', label: 'Target Type' },
  { key: 'targetId', label: 'Target ID' },
  { key: 'description', label: 'Description' },
  { key: 'ipAddress', label: 'IP Address' },
]

function toExportRows(logs) {
  return logs.map((log) => ({
    createdAt: log.createdAt ? new Date(log.createdAt).toLocaleString('en-IN') : '',
    adminName: log.adminName || '',
    module: log.module || '',
    action: log.action || '',
    targetType: log.targetType || '',
    targetId: log.targetId || '',
    description: log.description || '',
    ipAddress: log.ipAddress || 'Not available',
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

export function exportActivityLogsToCsv(logs) {
  const rows = toExportRows(logs)
  const header = EXPORT_COLUMNS.map((col) => escapeCsvCell(col.label)).join(',')
  const body = rows.map((row) => EXPORT_COLUMNS.map((col) => escapeCsvCell(row[col.key])).join(',')).join('\n')
  downloadBlob(`${header}\n${body}`, 'activity-logs.csv', 'text/csv;charset=utf-8;')
}

function escapeHtml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function exportActivityLogsToExcel(logs) {
  const rows = toExportRows(logs)
  const headerRow = `<tr>${EXPORT_COLUMNS.map((col) => `<th>${escapeHtml(col.label)}</th>`).join('')}</tr>`
  const bodyRows = rows
    .map((row) => `<tr>${EXPORT_COLUMNS.map((col) => `<td>${escapeHtml(row[col.key])}</td>`).join('')}</tr>`)
    .join('')
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8" /></head>
<body><table>${headerRow}${bodyRows}</table></body>
</html>`
  downloadBlob(html, 'activity-logs.xls', 'application/vnd.ms-excel')
}
