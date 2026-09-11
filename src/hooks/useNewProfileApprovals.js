import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  getNewProfileApprovals,
  subscribeToPendingNewProfiles,
  subscribeToPendingNewProfileCount,
} from '@/services/newProfileApprovalService'

const DEFAULT_FILTERS = {
  status: 'PENDING',
}

export function usePendingNewProfilesCount() {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isCancelled = false
    getNewProfileApprovals({ limit: 1, status: 'PENDING' })
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

export function useNewProfileApprovals() {
  const [profiles, setProfiles] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const fetchProfiles = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getNewProfileApprovals({
        page,
        limit: pageSize,
        status: filters.status || 'PENDING',
      })
      setProfiles(res.profiles)
      setPagination(res.pagination)
    } catch (err) {
      console.error('Failed to load new profile approvals:', err)
      setError(err?.message || 'Could not load new profile approvals.')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, filters.status])

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  const enrichedProfiles = useMemo(() => {
    return profiles.map((p) => {
      const user = p.user || {}
      return {
        ...p,
        userName: user.name || p.fullName || '—',
        userPhone: user.mobile || user.phone || '—',
        userEmail: user.email || '—',
        completion: p.completion || 80,
      }
    })
  }, [profiles])

  const filteredProfiles = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return enrichedProfiles

    return enrichedProfiles.filter((p) =>
      [p.fullName, p.id, p.userName, p.userPhone, p.userEmail, p.city, p.userId].some((f) =>
        String(f || '').toLowerCase().includes(term)
      )
    )
  }, [enrichedProfiles, searchTerm])

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
    profiles: filteredProfiles,
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
    refetch: fetchProfiles,
  }
}
