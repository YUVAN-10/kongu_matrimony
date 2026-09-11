import api from '@/lib/api'
import { formatDate } from '@/utils/helpers'

function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '')
}

/**
 * Normalizes a user record from the backend for consistent frontend usage.
 */
export function normalizeUser(user) {
  if (!user) return null
  const profile = user.profile || {}
  const subscriptions = user.subscriptions || []
  const hasActiveSub = subscriptions.some((s) => s.status === 'ACTIVE' || s.status === 'active')

  return {
    id: user.id,
    name: user.name || user.fullName || profile.fullName || '—',
    email: user.email || '—',
    phone: user.mobile || user.phone || '—',
    mobile: user.mobile || user.phone || '—',
    gender: (user.gender || profile.gender || '').toUpperCase(),
    city: profile.city || user.city || '—',
    role: user.role || 'user',
    status: (user.status || 'ACTIVE').toUpperCase(),
    isBlocked: (user.status || '').toUpperCase() === 'BLOCKED',
    isPremium: profile.isPremium || user.isPremium || hasActiveSub,
    photoURL: profile.profileImageUrl || user.photoURL || null,
    profileImageUrl: profile.profileImageUrl || null,
    createdAt: user.createdAt,
    lastActiveAt: user.lastActiveAt,
    profile,
    subscriptions,
    paymentRequests: user.paymentRequests || [],
  }
}

/**
 * 3.1 Get Users List
 * GET /api/admin/users
 * Query params: page, limit, search, status
 */
export async function getUsers({ page = 1, limit = 10, search = '', status = '' } = {}) {
  const params = {
    page,
    limit,
  }

  if (search && search.trim()) {
    params.search = search.trim()
  }

  if (status && status !== 'all' && status !== 'ALL') {
    params.status = status.toUpperCase()
  }

  const response = await api.get('/admin/users', params)
  const data = response?.data || response
  const rawUsers = data?.users || []
  const pagination = data?.pagination || {
    page,
    limit,
    total: rawUsers.length,
    totalPages: Math.ceil(rawUsers.length / limit) || 1,
  }

  return {
    users: rawUsers.map(normalizeUser),
    pagination,
  }
}

/**
 * 3.2 Get User Details
 * GET /api/admin/users/:id
 */
export async function getUserById(userId) {
  if (!userId) return null
  const response = await api.get(`/admin/users/${userId}`)
  const rawUser = response?.data || response?.user || response
  return normalizeUser(rawUser)
}

/**
 * 3.3 Create User
 * POST /api/admin/users
 * Body: { name, email, phone, gender, city, tempPassword }
 */
export async function createUser({ name, email, phone, gender, city, tempPassword }) {
  const payload = {
    name: name?.trim(),
    email: email?.trim()?.toLowerCase(),
    phone: normalizePhone(phone),
    gender: gender?.toUpperCase(),
    city: city?.trim() || undefined,
    tempPassword: tempPassword || undefined,
  }

  const response = await api.post('/admin/users', payload)
  return response?.data || response
}

/**
 * 3.4 Update User
 * PUT /api/admin/users/:id
 * Body: { name, email, phone, gender, city }
 */
export async function updateUser(userId, { name, email, phone, gender, city }) {
  const payload = {
    name: name?.trim(),
    email: email?.trim()?.toLowerCase(),
    phone: normalizePhone(phone),
    gender: gender?.toUpperCase(),
    city: city?.trim() || undefined,
  }

  const response = await api.put(`/admin/users/${userId}`, payload)
  return response?.data || response
}

/**
 * 3.5 Update User Status (Block / Unblock)
 * PATCH /api/admin/users/:id/status
 * Body: { status: "ACTIVE" | "BLOCKED" }
 */
export async function updateUserStatus(userId, status) {
  const normalizedStatus = status.toUpperCase() === 'BLOCKED' ? 'BLOCKED' : 'ACTIVE'
  const response = await api.patch(`/admin/users/${userId}/status`, {
    status: normalizedStatus,
  })
  return response?.data || response
}

export async function blockUser(userId) {
  return updateUserStatus(userId, 'BLOCKED')
}

export async function unblockUser(userId) {
  return updateUserStatus(userId, 'ACTIVE')
}

export async function searchUsersOnce(term) {
  const res = await getUsers({ page: 1, limit: 50, search: term })
  return res.users
}

export async function searchUsersByPhone(phone) {
  const res = await getUsers({ page: 1, limit: 10, search: phone })
  return res.users
}

export async function searchUsersByEmail(email) {
  const res = await getUsers({ page: 1, limit: 10, search: email })
  return res.users
}

export async function searchUsersByName(name) {
  const res = await getUsers({ page: 1, limit: 10, search: name })
  return res.users
}

export async function createUserDocument(uid, data) {
  return createUser(data)
}

export async function softDeleteUser(userId) {
  return blockUser(userId)
}

/**
 * Export helpers
 */
export function exportUsersToCsv(users) {
  if (!users || users.length === 0) return

  const headers = ['ID', 'Name', 'Email', 'Phone', 'Gender', 'City', 'Subscription', 'Status', 'Created Date']
  const rows = users.map((u) => [
    `"${u.id || ''}"`,
    `"${u.name || ''}"`,
    `"${u.email || ''}"`,
    `"${u.phone || ''}"`,
    `"${u.gender || ''}"`,
    `"${u.city || ''}"`,
    `"${u.isPremium ? 'Premium' : 'Free'}"`,
    `"${u.status || ''}"`,
    `"${formatDate(u.createdAt) || ''}"`,
  ])

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `users_export_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportUsersToExcel(users) {
  exportUsersToCsv(users)
}

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  blockUser,
  unblockUser,
  searchUsersOnce,
  searchUsersByPhone,
  searchUsersByEmail,
  searchUsersByName,
  exportUsersToCsv,
  exportUsersToExcel,
}