import { useEffect, useRef, useState } from 'react'
import {
  subscribeToProfilesPage,
  subscribeToProfilesForSearch,
  getProfilesCount,
} from '@/services/profileService'
import { toDate } from '@/utils/helpers'
import { subscribeWithRetry } from '@/utils/subscribeWithRetry'

const DEFAULT_FILTERS = {
  gender: '',
  religion: '',
  city: '',
  occupation: '',
  subscription: '',
  createdBy: '',
  status: '',
  dateFrom: '',
  dateTo: '',
}

function sortProfilesClientSide(profiles, sortBy) {
  const sorted = [...profiles]
  switch (sortBy) {
    case 'oldest':
      return sorted.sort(
        (a, b) =>
          (toDate(a.system?.createdAt)?.getTime() || 0) - (toDate(b.system?.createdAt)?.getTime() || 0)
      )
    case 'name_asc':
      return sorted.sort((a, b) => (a.personal?.fullName || '').localeCompare(b.personal?.fullName || ''))
    case 'name_desc':
      return sorted.sort((a, b) => (b.personal?.fullName || '').localeCompare(a.personal?.fullName || ''))
    case 'newest':
    default:
      return sorted.sort(
        (a, b) =>
          (toDate(b.system?.createdAt)?.getTime() || 0) - (toDate(a.system?.createdAt)?.getTime() || 0)
      )
  }
}

/**
 * Orchestrates the Profiles list: search, filters, sort, and pagination.
 * Architecturally identical to useUsers.js — see that file's comment for
 * the full rationale on the dual query-mode (server-paginated vs capped
 * client-filtered search) approach.
 */
export function useProfiles() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [sortBy, setSortBy] = useState('newest')
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)

  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(null)

  const cursorsRef = useRef([])
  const isSearching = searchTerm.trim().length > 0

  useEffect(() => {
    setPage(1)
    cursorsRef.current = []
  }, [filters, sortBy, pageSize, searchTerm])

  useEffect(() => {
    if (isSearching) {
      setTotalCount(null)
      return
    }
    let cancelled = false
    getProfilesCount(filters)
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
        (onData, onError) => subscribeToProfilesForSearch({ filters }, onData, onError),
        (allMatches) => {
          const term = searchTerm.trim().toLowerCase()
          const matched = allMatches.filter((profile) =>
            [profile.personal?.fullName, profile.personal?.mobileNumber, profile.personal?.email, profile.id].some(
              (field) => String(field || '').toLowerCase().includes(term)
            )
          )
          const sorted = sortProfilesClientSide(matched, sortBy)
          setHasMore(sorted.length > page * pageSize)
          setProfiles(sorted.slice((page - 1) * pageSize, page * pageSize))
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
        (onData, onError) => subscribeToProfilesPage({ filters, sortBy, pageSize, cursor }, onData, onError),
        (pageProfiles, lastVisible) => {
          if (page - 1 === cursorsRef.current.length && lastVisible) {
            cursorsRef.current[page - 1] = lastVisible
          }
          setHasMore(pageProfiles.length === pageSize)
          setProfiles(pageProfiles)
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
    profiles,
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
