import api from '@/lib/api'

/**
 * 4.3 Get Profile Change Requests
 * GET /api/admin/profile-change-requests
 * Query params: page, limit, status (default PENDING)
 */
export async function getProfileChangeRequests({ page = 1, limit = 10, status = 'PENDING' } = {}) {
  const response = await api.get('/admin/profile-change-requests', {
    page,
    limit,
    status: status ? status.toUpperCase() : undefined,
  })
  const data = response?.data || response
  return {
    requests: data?.requests || [],
    pagination: data?.pagination || { page, limit, total: 0, totalPages: 1 },
  }
}

export async function getChangeRequestById(requestId) {
  const response = await api.get(`/admin/profile-change-requests/${requestId}`)
  return response?.data || response?.request || response
}

/**
 * 4.4 Review Profile Change Request (Approve / Reject)
 * PATCH /api/admin/profile-change-requests/:id/status
 * Body: { status: "APPROVED" | "REJECTED" }
 */
export async function reviewProfileChangeRequest(requestId, status) {
  const normalizedStatus = status.toUpperCase() === 'APPROVED' ? 'APPROVED' : 'REJECTED'
  const response = await api.patch(`/admin/profile-change-requests/${requestId}/status`, {
    status: normalizedStatus,
  })
  return response?.data || response
}

export async function approveChangeRequest(requestId) {
  return reviewProfileChangeRequest(requestId, 'APPROVED')
}

export async function rejectChangeRequest(requestId) {
  return reviewProfileChangeRequest(requestId, 'REJECTED')
}

export const approveProfileChangeRequest = approveChangeRequest
export const rejectProfileChangeRequest = rejectChangeRequest

export function subscribeToChangeRequests(onData, onError) {
  let isCancelled = false
  getProfileChangeRequests({ page: 1, limit: 100, status: 'PENDING' })
    .then((res) => {
      if (!isCancelled) onData(res.requests)
    })
    .catch((err) => {
      if (!isCancelled && onError) onError(err)
    })

  return () => {
    isCancelled = true
  }
}

export function subscribeToPendingCount(onCount, onError) {
  let isCancelled = false
  getProfileChangeRequests({ page: 1, limit: 1, status: 'PENDING' })
    .then((res) => {
      if (!isCancelled) onCount(res.pagination?.total || 0)
    })
    .catch((err) => {
      if (!isCancelled && onError) onError(err)
    })

  return () => {
    isCancelled = true
  }
}

export const subscribeToPendingChangeRequests = subscribeToChangeRequests
export const subscribeToPendingChangeRequestCount = subscribeToPendingCount

export default {
  getProfileChangeRequests,
  getChangeRequestById,
  reviewProfileChangeRequest,
  approveChangeRequest,
  rejectChangeRequest,
  approveProfileChangeRequest,
  rejectProfileChangeRequest,
  subscribeToChangeRequests,
  subscribeToPendingCount,
  subscribeToPendingChangeRequests,
  subscribeToPendingChangeRequestCount,
}
