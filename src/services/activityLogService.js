import { collection, addDoc, doc, getDoc, getDocs, query, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase/firebase'
import { removeUndefined } from '@/utils/removeUndefined'

const ACTIVITY_LOGS_COLLECTION = 'activityLogs'

export function generateActivityLogId() {
  return doc(collection(db, ACTIVITY_LOGS_COLLECTION)).id
}

function mapSnapshot(snapshot) {
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
}

/** Realtime, whole-collection subscription — audit history is admin-curated
 * volume (bounded by how many actions admins actually take), same reasoning
 * as every other non-paginated module in this app. */
export function subscribeToActivityLogs(onData, onError) {
  const logsQuery = query(collection(db, ACTIVITY_LOGS_COLLECTION), orderBy('createdAt', 'desc'), limit(2000))
  return onSnapshot(logsQuery, (snapshot) => onData(mapSnapshot(snapshot)), onError)
}

export async function getActivityLogById(logId) {
  const snap = await getDoc(doc(db, ACTIVITY_LOGS_COLLECTION, logId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

/** All log entries for one target document (e.g. one user's full history) — powers ActivityTimeline.jsx. */
export async function getActivityLogsForTarget(targetType, targetId) {
  const targetQuery = query(collection(db, ACTIVITY_LOGS_COLLECTION), orderBy('createdAt', 'desc'), limit(500))
  const snapshot = await getDocs(targetQuery)
  return mapSnapshot(snapshot).filter((log) => log.targetType === targetType && log.targetId === targetId)
}

/**
 * Resolves the identity fields every log entry needs from whatever `admin`
 * object a caller has on hand — almost always `currentAdmin` straight from
 * useAuth(), which already carries uid/name/email/role. Centralized so the
 * "fall back to email if no name" logic exists in exactly one place.
 */
export function getAdminIdentity(admin) {
  return {
    adminId: admin?.uid || null,
    adminName: admin?.name || admin?.email || 'Admin',
    adminRole: admin?.role || null,
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

// De-dupe guard: the exact same (admin, action, target) combination logged
// again within this window is dropped — protects against a double-click or
// a React StrictMode double-invoke firing the same mutation (and therefore
// the same log call) twice, without needing any UI-level debounce.
const DUPLICATE_WINDOW_MS = 4000
const recentLogKeys = new Map()

function pruneOldKeys(now) {
  for (const [key, timestamp] of recentLogKeys) {
    if (now - timestamp > DUPLICATE_WINDOW_MS) recentLogKeys.delete(key)
  }
}

/**
 * The single, canonical way every module records an admin action — per the
 * module spec, no service should ever call addDoc(activityLogs, ...)
 * directly. See the module's Output explanation for the full per-module
 * integration list.
 *
 * IP address isn't populated: a browser has no reliable way to learn its
 * own public IP without calling a third-party lookup service, which this
 * app deliberately doesn't add as a dependency for one field. The column
 * exists in the schema and displays "Not available" — a real deployment
 * would populate it server-side (e.g. a Cloud Function trigger reading the
 * request's source IP), which is a natural next step, not a redesign.
 *
 * Firestore write failures are caught and logged to console, never thrown —
 * a failed AUDIT LOG write must never roll back or block the business
 * operation it's recording (e.g. blocking a user must still succeed even
 * if, for some reason, this specific write fails).
 */
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
    await addDoc(collection(db, ACTIVITY_LOGS_COLLECTION), removeUndefined({
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
      createdAt: serverTimestamp(),
    }))
  } catch (error) {
    console.error('[activityLogService] Failed to write activity log (business operation still succeeded):', error)
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
    createdAt: log.createdAt?.toDate ? log.createdAt.toDate().toLocaleString('en-IN') : '',
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

// Same dependency-free HTML-table-as-.xls technique used elsewhere in this
// app — deliberately avoids the vulnerable npm `xlsx` package.
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
