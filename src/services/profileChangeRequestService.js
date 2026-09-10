import api from '@/lib/api'
import { logActivity } from '@/services/activityLogService'
import { getProfileById as getProfileByIdFromProfileService } from '@/services/profileService'

export const getProfileById = getProfileByIdFromProfileService

export async function getProfileByUserId(userId) {
  if (!userId) return null
  try {
    const response = await api.get(`/profiles/user/${userId}`)
    return response?.profile || response?.data || response
  } catch {
    const res = await api.get('/profiles', { userId, limit: 1 })
    const list = Array.isArray(res) ? res : (res?.profiles || res?.data || [])
    return list[0] || null
  }
}

export async function createProfileChangeRequest({ profileId, userId, changes, submittedBy }) {
  if (!changes || Object.keys(changes).length === 0) {
    throw new Error('No profile changes detected.')
  }

  const payload = {
    profileId,
    userId,
    changes,
    submittedBy,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  const response = await api.post('/profile-change-requests', payload)
  const requestId = response?.requestId || response?.id || response?.data?.id || `req_${Date.now()}`

  logActivity({
    action: 'submit_profile_change',
    module: 'Profiles',
    targetType: 'profile_change_request',
    targetId: requestId,
    description: `Submitted ${Object.keys(changes).length} profile change(s) for review`,
    newData: { profileId, userId, status: 'pending' },
    admin: { uid: submittedBy, name: 'Client' },
  })

  return requestId
}

export function subscribeToPendingChangeRequests(onData, onError) {
  let isCancelled = false

  async function fetchRequests() {
    try {
      const response = await api.get('/profile-change-requests', { status: 'pending' })
      const list = Array.isArray(response) ? response : (response?.requests || response?.data || [])
      if (!isCancelled) onData(list)
    } catch (err) {
      if (!isCancelled && onError) onError(err)
    }
  }

  fetchRequests()

  return () => {
    isCancelled = true
  }
}

export function subscribeToApprovedChangeRequests(onData, onError) {
  let isCancelled = false

  async function fetchRequests() {
    try {
      const response = await api.get('/profile-change-requests', { status: 'approved' })
      const list = Array.isArray(response) ? response : (response?.requests || response?.data || [])
      if (!isCancelled) onData(list)
    } catch (err) {
      if (!isCancelled && onError) onError(err)
    }
  }

  fetchRequests()

  return () => {
    isCancelled = true
  }
}

export function subscribeToRejectedChangeRequests(onData, onError) {
  let isCancelled = false

  async function fetchRequests() {
    try {
      const response = await api.get('/profile-change-requests', { status: 'rejected' })
      const list = Array.isArray(response) ? response : (response?.requests || response?.data || [])
      if (!isCancelled) onData(list)
    } catch (err) {
      if (!isCancelled && onError) onError(err)
    }
  }

  fetchRequests()

  return () => {
    isCancelled = true
  }
}

export function subscribeToChangeRequests(onData, onError) {
  let isCancelled = false

  async function fetchRequests() {
    try {
      const response = await api.get('/profile-change-requests', { limit: 2000 })
      const list = Array.isArray(response) ? response : (response?.requests || response?.data || [])
      if (!isCancelled) onData(list)
    } catch (err) {
      if (!isCancelled && onError) onError(err)
    }
  }

  fetchRequests()

  return () => {
    isCancelled = true
  }
}

export async function getChangeRequestById(requestId) {
  const response = await api.get(`/profile-change-requests/${requestId}`)
  return response?.request || response?.data || response
}

export async function approveProfileChangeRequest({ requestId, admin }) {
  const request = await getChangeRequestById(requestId)
  if (!request) {
    throw new Error('This change request no longer exists.')
  }
  if (request.status !== 'pending') {
    throw new Error('This change request has already been reviewed.')
  }

  const now = new Date().toISOString()
  const payload = {
    status: 'approved',
    reviewedBy: admin?.uid || admin?.id || null,
    reviewedAt: now,
  }

  await api.post(`/profile-change-requests/${requestId}/approve`, payload).catch(async () => {
    await api.put(`/profile-change-requests/${requestId}`, payload)
  })

  const changes = request.changes || {}
  const changeCount = Object.keys(changes).length

  logActivity({
    action: 'approve_profile_change',
    module: 'Profiles',
    targetType: 'profile_change_request',
    targetId: requestId,
    description: `Approved ${changeCount} profile change(s) for profile "${request.profileId}"`,
    newData: { profileId: request.profileId, status: 'approved' },
    admin,
  })
}

export async function rejectProfileChangeRequest({ requestId, admin, rejectionType, rejectionReason }) {
  if (!rejectionType?.trim()) {
    throw new Error('A rejection type is required.')
  }
  const trimmedReason = rejectionReason?.trim()
  if (!trimmedReason) {
    throw new Error('A rejection reason is required.')
  }

  const request = await getChangeRequestById(requestId)
  if (!request) {
    throw new Error('This change request no longer exists.')
  }
  if (request.status !== 'pending') {
    throw new Error('This change request has already been reviewed.')
  }

  const now = new Date().toISOString()
  const payload = {
    status: 'rejected',
    reviewedBy: admin?.uid || admin?.id || null,
    reviewedAt: now,
    rejectionType,
    rejectionReason: trimmedReason,
  }

  await api.post(`/profile-change-requests/${requestId}/reject`, payload).catch(async () => {
    await api.put(`/profile-change-requests/${requestId}`, payload)
  })

  logActivity({
    action: 'reject_profile_change',
    module: 'Profiles',
    targetType: 'profile_change_request',
    targetId: requestId,
    description: `Rejected profile change request for profile "${request.profileId}" — [${rejectionType}] ${trimmedReason}`,
    newData: { profileId: request.profileId, status: 'rejected', rejectionType, rejectionReason: trimmedReason },
    admin,
  })
}

export async function getPendingChangeRequestCount() {
  try {
    const response = await api.get('/profile-change-requests/count', { status: 'pending' })
    return typeof response?.count === 'number' ? response.count : 0
  } catch {
    const res = await api.get('/profile-change-requests', { status: 'pending' })
    return Array.isArray(res) ? res.length : (res?.requests?.length || 0)
  }
}

export function subscribeToPendingCount(onCount, onError) {
  let isCancelled = false

  async function fetchCount() {
    try {
      const count = await getPendingChangeRequestCount()
      if (!isCancelled) onCount(count)
    } catch (err) {
      if (!isCancelled && onError) onError(err)
    }
  }

  fetchCount()

  return () => {
    isCancelled = true
  }
}
