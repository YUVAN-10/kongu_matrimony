import api from '@/lib/api'
import { formatDate } from '@/utils/helpers'
import { logActivity } from '@/services/activityLogService'

function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '')
}

export function subscribeToUsersPage({ filters, sortBy, pageSize, cursor, page = 1 }, onData, onError) {
  let isCancelled = false

  async function fetchUsers() {
    try {
      const response = await api.get('/users', {
        ...filters,
        sortBy,
        pageSize,
        page,
        cursor,
      })

      const users = Array.isArray(response)
        ? response
        : (response?.users || response?.data || response?.items || [])
      const lastVisible = response?.lastVisible || (users.length > 0 ? users[users.length - 1]?.id : null)

      if (!isCancelled) {
        onData(users, lastVisible)
      }
    } catch (err) {
      if (!isCancelled && onError) onError(err)
    }
  }

  fetchUsers()

  return () => {
    isCancelled = true
  }
}

export function subscribeToUsersForSearch({ filters }, onData, onError) {
  let isCancelled = false

  async function fetchAll() {
    try {
      const response = await api.get('/users', {
        ...filters,
        limit: 1000,
        pageSize: 1000,
      })
      const users = Array.isArray(response)
        ? response
        : (response?.users || response?.data || response?.items || [])
      if (!isCancelled) onData(users)
    } catch (err) {
      if (!isCancelled && onError) onError(err)
    }
  }

  fetchAll()

  return () => {
    isCancelled = true
  }
}

export async function getUsersCount(filters) {
  try {
    const response = await api.get('/users/count', filters)
    if (typeof response?.count === 'number') return response.count
    if (typeof response === 'number') return response
  } catch {
    const res = await api.get('/users', { ...filters, limit: 1 })
    return res?.total || res?.totalCount || (Array.isArray(res) ? res.length : 0)
  }
  return 0
}

export async function getUserById(userId) {
  const response = await api.get(`/users/${userId}`)
  return response?.user || response?.data || response
}

export async function searchUsersOnce(term) {
  const trimmed = term?.trim()
  if (!trimmed) return []

  const response = await api.get('/users/search', { term: trimmed, limit: 50 })
  return Array.isArray(response) ? response : (response?.users || response?.data || [])
}

export async function reservePhoneNumber(phone, userId = null) {
  const normalized = normalizePhone(phone)
  if (!normalized) throw new Error('A valid phone number is required.')

  await api.post('/users/reserve-phone', { phone: normalized, userId }).catch(() => {})
  return normalized
}

export async function releasePhoneReservation(phone) {
  const normalized = normalizePhone(phone)
  if (!normalized) return
  await api.post('/users/release-phone', { phone: normalized }).catch(() => {})
}

export async function searchUsersByPhone(phone) {
  const normalized = normalizePhone(phone)
  if (!normalized) return []

  const response = await api.get('/users', { phone: normalized, limit: 1 })
  const users = Array.isArray(response) ? response : (response?.users || response?.data || [])
  return users.filter((u) => normalizePhone(u.phone) === normalized)
}

export async function searchUsersByEmail(email) {
  if (!email?.trim()) return []

  const normalized = email.trim().toLowerCase()
  const response = await api.get('/users', { email: normalized, limit: 1 })
  const users = Array.isArray(response) ? response : (response?.users || response?.data || [])
  return users.filter((u) => (u.email || '').toLowerCase() === normalized)
}

export async function searchUsersByName(name) {
  const normalized = name?.trim().toLowerCase()
  if (!normalized) return []

  const response = await api.get('/users', { name: normalized, limit: 1000 })
  const users = Array.isArray(response) ? response : (response?.users || response?.data || [])
  return users.filter((u) => (u.name || '').trim().toLowerCase() === normalized)
}

export async function createUserDocument(uid, { name, email, phone, gender, city, admin }) {
  const payload = {
    id: uid,
    name,
    email,
    phone: normalizePhone(phone),
    gender,
    ...(city?.trim() && { city: city.trim() }),
    status: 'active',
    isPremium: false,
    createdBy: admin?.name || admin?.email || 'Admin',
    createdAt: new Date().toISOString(),
  }

  await api.post('/users', payload)

  logActivity({
    action: 'create',
    module: 'Users',
    targetType: 'user',
    targetId: uid,
    description: `Created user "${name}"`,
    newData: { name, email, phone, gender, city },
    admin,
  })
}

export async function updateUser(userId, data, { admin } = {}) {
  const newPhone = normalizePhone(data.phone)
  const payload = {
    name: data.name,
    email: data.email,
    phone: newPhone,
    gender: data.gender,
    city: data.city || null,
    updatedAt: new Date().toISOString(),
  }

  await api.put(`/users/${userId}`, payload)

  logActivity({
    action: 'update',
    module: 'Users',
    targetType: 'user',
    targetId: userId,
    description: `Updated user "${data.name || userId}"`,
    newData: payload,
    admin,
  })
}

export async function blockUser(userId, { reason, admin }) {
  const payload = {
    isBlocked: true,
    status: 'blocked',
    blockReason: reason,
    blockedAt: new Date().toISOString(),
    blockedBy: admin?.name || admin?.email || 'Admin',
  }

  await api.patch(`/users/${userId}/block`, payload).catch(async () => {
    await api.put(`/users/${userId}`, payload)
  })

  logActivity({
    action: 'block',
    module: 'Users',
    targetType: 'user',
    targetId: userId,
    description: `Blocked user${reason ? ` — reason: ${reason}` : ''}`,
    newData: { status: 'blocked', reason },
    admin,
  })
}

export async function unblockUser(userId, { admin }) {
  const payload = {
    isBlocked: false,
    status: 'active',
    blockReason: null,
    unblockedAt: new Date().toISOString(),
    unblockedBy: admin?.name || admin?.email || 'Admin',
  }

  await api.patch(`/users/${userId}/unblock`, payload).catch(async () => {
    await api.put(`/users/${userId}`, payload)
  })

  logActivity({
    action: 'unblock',
    module: 'Users',
    targetType: 'user',
    targetId: userId,
    description: 'Unblocked user',
    newData: { status: 'active' },
    admin,
  })
}

export async function softDeleteUser(userId, { admin }) {
  const payload = {
    status: 'deleted',
    deletedAt: new Date().toISOString(),
    deletedBy: admin?.name || admin?.email || 'Admin',
  }

  await api.delete(`/users/${userId}`).catch(async () => {
    await api.patch(`/users/${userId}/soft-delete`, payload).catch(async () => {
      await api.put(`/users/${userId}`, payload)
    })
  })

  logActivity({
    action: 'delete',
    module: 'Users',
    targetType: 'user',
    targetId: userId,
    description: 'Deleted user (soft delete)',
    newData: { status: 'deleted' },
    admin,
  })
}

const EXPORT_COLUMNS = [
  { key: 'id', label: 'User ID' },
  { key: 'name', label: 'Name' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'gender', label: 'Gender' },
  { key: 'city', label: 'City' },
  { key: 'subscription', label: 'Subscription' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Created Date' },
]

function toExportRows(users) {
  return users.map((user) => ({
    id: user.id || user._id,
    name: user.name || '',
    phone: user.phone || '',
    email: user.email || '',
    gender: user.gender || '',
    city: user.city || '',
    subscription: user.isPremium ? 'Premium' : 'Free',
    status: user.status || '',
    createdAt: formatDate(user.createdAt),
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

export function exportUsersToCsv(users) {
  const rows = toExportRows(users)
  const header = EXPORT_COLUMNS.map((col) => escapeCsvCell(col.label)).join(',')
  const body = rows
    .map((row) => EXPORT_COLUMNS.map((col) => escapeCsvCell(row[col.key])).join(','))
    .join('\n')
  downloadBlob(`${header}\n${body}`, 'users.csv', 'text/csv;charset=utf-8;')
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function exportUsersToExcel(users) {
  const rows = toExportRows(users)
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

  downloadBlob(html, 'users.xls', 'application/vnd.ms-excel')
}