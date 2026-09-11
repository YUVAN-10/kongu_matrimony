import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  getProfileChangeRequests,
  subscribeToChangeRequests,
  subscribeToPendingCount,
} from '@/services/profileChangeRequestService'

const DEFAULT_FILTERS = {
  status: 'PENDING',
}

export function usePendingChangeRequestsCount() {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isCancelled = false
    getProfileChangeRequests({ limit: 1, status: 'PENDING' })
      .then((res) => {
        if (!isCancelled) {
          setCount(res.pagination?.total || 0)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!isCancelled) setLoading(false)
      })

    return () => {
      isCancelled = true
    }
  }, [])

  return { count, loading }
}

export function useProfileChangeRequests() {
  const [requests, setRequests] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getProfileChangeRequests({
        page,
        limit: pageSize,
        status: filters.status || 'PENDING',
      })
      setRequests(res.requests)
      setPagination(res.pagination)
    } catch (err) {
      console.error('Failed to load profile change requests:', err)
      setError(err?.message || 'Could not load profile change requests.')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, filters.status])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const enrichedRequests = useMemo(() => {
    return requests.map((request) => {
      const profile = request.profile || {}
      const user = request.user || {}
      return {
        ...request,
        profileName: request.profileName || profile.fullName || '—',
        profilePhoto: request.profilePhoto || profile.profileImageUrl || null,
        userName: request.userName || user.name || '—',
        userPhone: request.userPhone || user.mobile || user.phone || '—',
        changeCount: Object.keys(request.changes || {}).length,
      }
    })
  }, [requests])

  const filteredRequests = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return enrichedRequests

    return enrichedRequests.filter((r) =>
      [r.profileName, r.profileId, r.userName, r.userPhone, r.userId].some((field) =>
        String(field || '').toLowerCase().includes(term)
      )
    )
  }, [enrichedRequests, searchTerm])

  function updateFilters(patch) {
    setFilters((prev) => ({ ...prev, ...patch }))
    setPage(1)
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS)
    setSearchTerm('')
    setPage(1)
  }

  function goToNextPage() {
    if (page < pagination.totalPages) setPage((prev) => prev + 1)
  }

  function goToPreviousPage() {
    if (page > 1) setPage((prev) => prev - 1)
  }

  return {
    requests: filteredRequests,
    totalCount: pagination.total,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filters,
    updateFilters,
    resetFilters,
    page,
    pageSize,
    setPageSize,
    hasMore: page < pagination.totalPages,
    goToNextPage,
    goToPreviousPage,
    refetch: fetchRequests,
  }
}
