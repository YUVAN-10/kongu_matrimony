import api from '@/lib/api'
import { logActivity } from '@/services/activityLogService'
import { getProfileById } from '@/services/profileService'

export { getProfileById as getNewProfileById }

export function subscribeToPendingNewProfiles(onData, onError) {
  let isCancelled = false

  async function fetchPending() {
    try {
      const response = await api.get('/new-profile-approvals', { status: 'pending_approval' })
      const list = Array.isArray(response)
        ? response
        : (response?.profiles || response?.data || [])
      if (!isCancelled) onData(list)
    } catch (err) {
      if (!isCancelled && onError) onError(err)
    }
  }

  fetchPending()

  return () => {
    isCancelled = true
  }
}

export function subscribeToPendingNewProfileCount(onCount, onError) {
  let isCancelled = false

  async function fetchCount() {
    try {
      const response = await api.get('/new-profile-approvals/count', { status: 'pending_approval' })
      const count = typeof response?.count === 'number' ? response.count : (Array.isArray(response) ? response.length : 0)
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

export async function getPendingNewProfileCount() {
  try {
    const response = await api.get('/new-profile-approvals/count', { status: 'pending_approval' })
    return typeof response?.count === 'number' ? response.count : 0
  } catch {
    const res = await api.get('/new-profile-approvals', { status: 'pending_approval' })
    return Array.isArray(res) ? res.length : (res?.profiles?.length || 0)
  }
}

export async function approveNewProfile(profileId, { admin }) {
  const now = new Date().toISOString()
  const payload = {
    status: 'active',
    approvedBy: admin?.uid || admin?.id || null,
    approvedAt: now,
  }

  await api.post(`/new-profile-approvals/${profileId}/approve`, payload).catch(async () => {
    await api.put(`/profiles/${profileId}`, {
      'system.status': 'active',
      'system.approvedBy': admin?.uid || null,
      'system.approvedAt': now,
      'system.updatedAt': now,
    })
  })

  logActivity({
    action: 'new_profile_approved',
    module: 'Profiles',
    targetType: 'profile',
    targetId: profileId,
    description: `Approved new profile "${profileId}"`,
    newData: { status: 'active' },
    admin,
  })
}

export async function rejectNewProfile(profileId, { admin, rejectionReason }) {
  const trimmedReason = rejectionReason?.trim()
  if (!trimmedReason) {
    throw new Error('A rejection reason is required.')
  }

  const now = new Date().toISOString()
  const payload = {
    status: 'rejected',
    rejectionReason: trimmedReason,
    rejectedBy: admin?.uid || admin?.id || null,
    rejectedAt: now,
  }

  await api.post(`/new-profile-approvals/${profileId}/reject`, payload).catch(async () => {
    await api.put(`/profiles/${profileId}`, {
      'system.status': 'rejected',
      'system.rejectionReason': trimmedReason,
      'system.rejectedBy': admin?.uid || null,
      'system.rejectedAt': now,
      'system.updatedAt': now,
    })
  })

  logActivity({
    action: 'new_profile_rejected',
    module: 'Profiles',
    targetType: 'profile',
    targetId: profileId,
    description: `Rejected new profile "${profileId}" — ${trimmedReason}`,
    newData: { status: 'rejected', rejectionReason: trimmedReason },
    admin,
  })
}

export async function resubmitProfile(profileId, { submittedBy }) {
  const now = new Date().toISOString()
  const payload = {
    status: 'pending_approval',
    submittedAt: now,
    submittedBy,
  }

  const response = await api.post(`/new-profile-approvals/${profileId}/resubmit`, payload).catch(async () => {
    await api.put(`/profiles/${profileId}`, {
      'system.status': 'pending_approval',
      'system.submittedAt': now,
      'system.submittedBy': submittedBy,
      'system.createdSource': 'client',
      'system.updatedAt': now,
    })
    return { previousStatus: 'draft' }
  })

  const previousStatus = response?.previousStatus || 'draft'

  logActivity({
    action: previousStatus === 'rejected' ? 'new_profile_resubmitted' : 'new_profile_submitted',
    module: 'Profiles',
    targetType: 'profile',
    targetId: profileId,
    description:
      previousStatus === 'rejected'
        ? `Resubmitted profile "${profileId}" for review after rejection`
        : `Submitted new profile "${profileId}" for review`,
    newData: { status: 'pending_approval' },
    admin: { uid: submittedBy, name: 'Client' },
  })
}
