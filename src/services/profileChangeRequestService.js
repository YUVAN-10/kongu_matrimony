import api from '@/lib/api'

/**
 * 4.3 Get Profile Change Requests
 * GET /api/admin/profile-change-requests
 * Query params: page, limit, status (default PENDING)
 */
export async function getProfileChangeRequests({ page = 1, limit = 10, status = 'PENDING' } = {}) {
  const normalizedStatus = (!status || status.toUpperCase() === 'ALL') ? undefined : status.toUpperCase()
  const response = await api.get('/admin/profile-change-requests', {
    page,
    limit,
    status: normalizedStatus,
  })
  const rawList = data?.requests || []
  // Rule: Only client pending requests are listed in Profile Change Approvals (hide admin direct requests)
  const clientRequests = rawList.filter((r) => {
    if (r.requestedBy === 'ADMIN' || r.actor === 'ADMIN' || r.source === 'ADMIN_PANEL') {
      return false
    }
    return true
  })

  return {
    requests: clientRequests,
    pagination: data?.pagination || { page, limit, total: clientRequests.length, totalPages: 1 },
  }
}

export async function getChangeRequestById(requestId) {
  const response = await api.get(`/admin/profile-change-requests/${requestId}`)
  return response?.data || response?.request || response
}

export async function createProfileChangeRequest(paramsOrUserId, changesParam) {
  let userId, changes, newProfileData
  if (typeof paramsOrUserId === 'object' && paramsOrUserId !== null) {
    userId = paramsOrUserId.userId || paramsOrUserId.profileId || paramsOrUserId.id
    changes = paramsOrUserId.changes
    newProfileData = paramsOrUserId.newProfileData
  } else {
    userId = paramsOrUserId
    changes = changesParam
  }

  const payload = {
    userId,
    profileId: userId,
    changes: changes || {},
    ...(newProfileData ? { newProfileData } : {}),
  }

  const response = await api.post('/admin/profile-change-requests', payload)
  return response?.data || response
}

/**
 * 4.4 Review Profile Change Request (Approve / Reject)
 * PATCH /api/admin/profile-change-requests/:id/status
 * Body: { status: "APPROVED" | "REJECTED" }
 */
export async function reviewProfileChangeRequest(requestIdOrParams, status) {
  const requestId =
    typeof requestIdOrParams === 'object' && requestIdOrParams !== null
      ? requestIdOrParams.requestId || requestIdOrParams.id
      : requestIdOrParams
  const finalStatus =
    typeof requestIdOrParams === 'object' && requestIdOrParams !== null && requestIdOrParams.status
      ? requestIdOrParams.status
      : status
  const normalizedStatus = String(finalStatus || '').toUpperCase() === 'APPROVED' ? 'APPROVED' : 'REJECTED'

  const response = await api.patch(`/admin/profile-change-requests/${requestId}/status`, {
    status: normalizedStatus,
  })
  return response?.data || response
}

export async function approveChangeRequest(requestIdOrParams) {
  return reviewProfileChangeRequest(requestIdOrParams, 'APPROVED')
}

export async function rejectChangeRequest(requestIdOrParams) {
  return reviewProfileChangeRequest(requestIdOrParams, 'REJECTED')
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
