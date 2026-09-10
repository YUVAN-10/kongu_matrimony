import { useEffect, useMemo, useState } from 'react'
import { subscribeToChangeRequests, subscribeToPendingCount } from '@/services/profileChangeRequestService'
import { useFirestoreCollection } from '@/hooks/useFirestoreCollection'
import { toDate } from '@/utils/helpers'
import { subscribeWithRetry } from '@/utils/subscribeWithRetry'

const DEFAULT_FILTERS = {
  status: '',
  profileId: '',
}

/** Realtime pending count — used by the Sidebar badge (cheap, mounted everywhere) and the Dashboard card. */
export function usePendingChangeRequestsCount() {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = subscribeWithRetry(
      subscribeToPendingCount,
      (value) => {
        setCount(value)
        setLoading(false)
      },
      () => setLoading(false)
    )
    return unsubscribe
  }, [])

  return { count, loading }
}

/**
 * Orchestrates the Profile Change Approvals list: realtime change requests
 * joined in-memory against profiles/users (the request only stores
 * profileId/userId, not the name/photo/phone the list needs to display),
 * then filtered/searched/paginated client-side — architecturally identical
 * to useActivityLogs.js (whole-collection subscribe, bounded admin-curated
 * volume, everything else derived in memory).
 */
export function useProfileChangeRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const profiles = useFirestoreCollection('profiles')
  const users = useFirestoreCollection('users')

  useEffect(() => {
    setLoading(true)
    setError(null)
    const unsubscribe = subscribeWithRetry(
      subscribeToChangeRequests,
      (data) => {
        setRequests(data)
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      }
    )
    return unsubscribe
  }, [])

  const profilesById = useMemo(() => new Map(profiles.data.map((p) => [p.id, p])), [profiles.data])
  const usersById = useMemo(() => new Map(users.data.map((u) => [u.id, u])), [users.data])

  const enrichedRequests = useMemo(() => {
    return requests.map((request) => {
      const profile = profilesById.get(request.profileId)
      const user = usersById.get(request.userId)
      return {
        ...request,
        profileName: profile?.personal?.fullName || 'Unnamed Profile',
        profilePhoto: profile?.photos?.main?.url || null,
        userName: user?.name || 'Unknown User',
        userPhone: user?.phone || '',
        changeCount: Object.keys(request.changes || {}).length,
      }
    })
  }, [requests, profilesById, usersById])

  useEffect(() => {
    setPage(1)
  }, [filters, searchTerm, pageSize])

  const filteredRequests = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    return enrichedRequests
      .filter((r) => !filters.status || r.status === filters.status)
      .filter((r) => !filters.profileId || r.profileId === filters.profileId)
      .filter((r) => {
        if (!term) return true
        return [r.profileName, r.profileId, r.userName, r.userPhone, r.userId].some((field) =>
          String(field || '').toLowerCase().includes(term)
        )
      })
      .sort((a, b) => (toDate(b.submittedAt)?.getTime() || 0) - (toDate(a.submittedAt)?.getTime() || 0))
  }, [enrichedRequests, searchTerm, filters])

  const hasMore = filteredRequests.length > page * pageSize
  const pageRequests = filteredRequests.slice((page - 1) * pageSize, page * pageSize)

  function updateFilters(patch) {
    setFilters((prev) => ({ ...prev, ...patch }))
  }
  function resetFilters() {
    setFilters(DEFAULT_FILTERS)
    setSearchTerm('')
  }
  function goToNextPage() {
    if (hasMore) setPage((prev) => prev + 1)
  }
  function goToPreviousPage() {
    setPage((prev) => Math.max(1, prev - 1))
  }

  return {
    requests: pageRequests,
    totalCount: filteredRequests.length,
    loading: loading || profiles.loading || users.loading,
    error,
    searchTerm,
    setSearchTerm,
    filters,
    updateFilters,
    resetFilters,
    page,
    pageSize,
    setPageSize,
    hasMore,
    goToNextPage,
    goToPreviousPage,
  }
}
