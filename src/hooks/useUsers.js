import { useEffect, useRef, useState } from 'react'
import {
  subscribeToUsersPage,
  subscribeToUsersForSearch,
  getUsersCount,
} from '@/services/userService'
import { toDate } from '@/utils/helpers'
import { subscribeWithRetry } from '@/utils/subscribeWithRetry'

const DEFAULT_FILTERS = {
  gender: '',
  subscription: '',
  status: '',
  city: '',
  dateFrom: '',
  dateTo: '',
}

function sortUsersClientSide(users, sortBy) {
  const sorted = [...users]
  switch (sortBy) {
    case 'oldest':
      return sorted.sort((a, b) => (toDate(a.createdAt)?.getTime() || 0) - (toDate(b.createdAt)?.getTime() || 0))
    case 'name_asc':
      return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    case 'name_desc':
      return sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''))
    case 'newest':
    default:
      return sorted.sort((a, b) => (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0))
  }
}

/**
 * Orchestrates the Users list: search, filters, sort, and pagination.
 *
 * Two query modes:
 *  - Default (no search term): true server-side pagination — a Firestore
 *    query (filters + sort + limit + startAfter cursor) subscribed via
 *    onSnapshot, so the current page updates in real time.
 *  - Search active: Firestore can't do multi-field substring search, so we
 *    subscribe to a capped (1000-doc), filtered-but-unpaginated result set
 *    and match name/phone/email/id client-side, then paginate the matches
 *    in memory. Still realtime (still onSnapshot), just not server-paginated.
 */
export function useUsers() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [sortBy, setSortBy] = useState('newest')
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(null)

  const cursorsRef = useRef([]) // cursorsRef.current[i] = last doc of page i+1, used to fetch page i+2
  const isSearching = searchTerm.trim().length > 0

  // Any change to the query shape invalidates cursors and returns to page 1.
  useEffect(() => {
    setPage(1)
    cursorsRef.current = []
  }, [filters, sortBy, pageSize, searchTerm])

  // Total count is a one-time aggregate (not realtime) recomputed per filter
  // change — unknown/hidden while searching since we only fetch a capped set.
  useEffect(() => {
    if (isSearching) {
      setTotalCount(null)
      return
    }
    let cancelled = false
    getUsersCount(filters)
      .then((count) => {
        if (!cancelled) setTotalCount(count)
      })
      .catch(() => {
        if (!cancelled) setTotalCount(null)
      })
    return () => {
      cancelled = true
    }
  }, [filters, isSearching])

  useEffect(() => {
    setLoading(true)
    setError(null)

    let unsubscribe

    if (isSearching) {
      unsubscribe = subscribeWithRetry(
        (onData, onError) => subscribeToUsersForSearch({ filters }, onData, onError),
        (allMatches) => {
          const term = searchTerm.trim().toLowerCase()
          const matched = allMatches.filter((user) =>
            [user.name, user.phone, user.email, user.id].some((field) =>
              String(field || '').toLowerCase().includes(term)
            )
          )
          const sorted = sortUsersClientSide(matched, sortBy)
          setHasMore(sorted.length > page * pageSize)
          setUsers(sorted.slice((page - 1) * pageSize, page * pageSize))
          setLoading(false)
        },
        (err) => {
          setError(err)
          setLoading(false)
        }
      )
    } else {
      const cursor = page > 1 ? cursorsRef.current[page - 2] : null
      unsubscribe = subscribeWithRetry(
        (onData, onError) => subscribeToUsersPage({ filters, sortBy, pageSize, cursor }, onData, onError),
        (pageUsers, lastVisible) => {
          // Only record the cursor the first time we reach this page —
          // otherwise a live update to the same page would keep overwriting
          // (and potentially corrupting) the cursor for the page after it.
          if (page - 1 === cursorsRef.current.length && lastVisible) {
            cursorsRef.current[page - 1] = lastVisible
          }
          setHasMore(pageUsers.length === pageSize)
          setUsers(pageUsers)
          setLoading(false)
        },
        (err) => {
          setError(err)
          setLoading(false)
        }
      )
    }

    return () => unsubscribe && unsubscribe()
  }, [filters, sortBy, pageSize, page, isSearching, searchTerm])

  function updateFilters(patch) {
    setFilters((prev) => ({ ...prev, ...patch }))
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS)
  }

  function goToNextPage() {
    if (hasMore) setPage((prev) => prev + 1)
  }

  function goToPreviousPage() {
    setPage((prev) => Math.max(1, prev - 1))
  }

  return {
    users,
    loading,
    error,
    hasMore,
    totalCount,
    isSearching,
    page,
    pageSize,
    setPageSize,
    goToNextPage,
    goToPreviousPage,
    searchTerm,
    setSearchTerm,
    filters,
    updateFilters,
    resetFilters,
    sortBy,
    setSortBy,
  }
}
