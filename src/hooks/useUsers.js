import { useEffect, useState, useCallback } from 'react'
import { getUsers } from '@/services/userService'

const DEFAULT_FILTERS = {
  status: 'ALL',
}

export function useUsers() {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)

  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Debounce search term by 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getUsers({
        page,
        limit: pageSize,
        search: debouncedSearch,
        status: filters.status,
      })
      setUsers(result.users)
      setPagination(result.pagination)
    } catch (err) {
      console.error('Failed to load users:', err)
      setError(err?.message || 'Failed to load users.')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, debouncedSearch, filters.status])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

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
    if (page < pagination.totalPages) {
      setPage((prev) => prev + 1)
    }
  }

  function goToPreviousPage() {
    if (page > 1) {
      setPage((prev) => prev - 1)
    }
  }

  return {
    users,
    loading,
    error,
    hasMore: page < pagination.totalPages,
    totalCount: pagination.total,
    page,
    pageSize,
    setPageSize: (size) => {
      setPageSize(size)
      setPage(1)
    },
    goToNextPage,
    goToPreviousPage,
    searchTerm,
    setSearchTerm,
    filters,
    updateFilters,
    resetFilters,
    refetch: fetchUsers,
  }
}
