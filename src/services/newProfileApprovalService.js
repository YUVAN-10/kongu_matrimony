import api from '@/lib/api'
import { getProfileById } from '@/services/profileService'

export { getProfileById as getNewProfileById }

/**
 * 4.1 Get New Profile Approvals
 * GET /api/admin/new-profile-approvals
 * Query params: page, limit, status (default PENDING)
 */
export async function getNewProfileApprovals({ page = 1, limit = 10, status = 'PENDING' } = {}) {
  const response = await api.get('/admin/new-profile-approvals', {
    page,
    limit,
    status: status.toUpperCase(),
  })
  const data = response?.data || response
  return {
    profiles: data?.profiles || [],
    pagination: data?.pagination || { page, limit, total: 0, totalPages: 1 },
  }
}

/**
 * 4.2 Review New Profile (Approve / Reject)
 * PATCH /api/admin/new-profile-approvals/:id/status
 * Body: { status: "APPROVED" | "REJECTED" }
 */
export async function reviewNewProfileApproval(profileId, status) {
  const normalizedStatus = status.toUpperCase() === 'APPROVED' ? 'APPROVED' : 'REJECTED'
  const response = await api.patch(`/admin/new-profile-approvals/${profileId}/status`, {
    status: normalizedStatus,
  })
  return response?.data || response
}

export async function approveNewProfile(profileId) {
  return reviewNewProfileApproval(profileId, 'APPROVED')
}

export async function rejectNewProfile(profileId) {
  return reviewNewProfileApproval(profileId, 'REJECTED')
}

export function subscribeToPendingNewProfiles(onData, onError) {
  let isCancelled = false
  getNewProfileApprovals({ status: 'PENDING' })
    .then((res) => {
      if (!isCancelled) onData(res.profiles)
    })
    .catch((err) => {
      if (!isCancelled && onError) onError(err)
    })

  return () => {
    isCancelled = true
  }
}

export function subscribeToPendingNewProfileCount(onCount, onError) {
  let isCancelled = false
  getNewProfileApprovals({ limit: 1, status: 'PENDING' })
    .then((res) => {
      if (!isCancelled) onCount(res.pagination.total)
    })
    .catch((err) => {
      if (!isCancelled && onError) onError(err)
    })

  return () => {
    isCancelled = true
  }
}

export default {
  getNewProfileApprovals,
  getNewProfileById: getProfileById,
  reviewNewProfileApproval,
  approveNewProfile,
  rejectNewProfile,
}
