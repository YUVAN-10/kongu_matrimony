import { useEffect, useMemo, useState } from 'react'
import {
  subscribeToPendingNewProfiles,
  subscribeToPendingNewProfileCount,
} from '@/services/newProfileApprovalService'
import { useFirestoreCollection } from '@/hooks/useFirestoreCollection'
import { calculateProfileCompletion } from '@/utils/profileCompletion'
import { toDate } from '@/utils/helpers'
import { subscribeWithRetry } from '@/utils/subscribeWithRetry'

const DEFAULT_FILTERS = {
  dateFrom: '',
  dateTo: '',
  gender: '',
  city: '',
  minCompletion: '',
}

/** Realtime pending count — used by the Sidebar badge (cheap, mounted everywhere) and the Dashboard card. */
export function usePendingNewProfilesCount() {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = subscribeWithRetry(
      subscribeToPendingNewProfileCount,
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
 * Orchestrates the New Profile Approvals list: realtime pending_approval
 * profiles joined in-memory against users (for name/phone/email, since a
 * profile only stores its own userId), then filtered/searched/paginated
 * client-side — architecturally identical to useProfileChangeRequests.js.
 */
export function useNewProfileApprovals() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const users = useFirestoreCollection('users')

  useEffect(() => {
    setLoading(true)
    setError(null)
    const unsubscribe = subscribeWithRetry(
      subscribeToPendingNewProfiles,
      (data) => {
        setProfiles(data)
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      }
    )
    return unsubscribe
  }, [])

  const usersById = useMemo(() => new Map(users.data.map((u) => [u.id, u])), [users.data])

  const enrichedProfiles = useMemo(() => {
    return profiles.map((profile) => {
      const user = usersById.get(profile.userId)
      return {
        ...profile,
        userName: user?.name || 'Unknown User',
        userPhone: user?.phone || profile.personal?.mobileNumber || '',
        userEmail: user?.email || profile.personal?.email || '',
        completion: calculateProfileCompletion(profile),
      }
    })
  }, [profiles, usersById])

  useEffect(() => {
    setPage(1)
  }, [filters, searchTerm, pageSize])

  const filteredProfiles = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    const minCompletion = filters.minCompletion ? Number(filters.minCompletion) : null

    return enrichedProfiles
      .filter((p) => !filters.gender || p.personal?.gender === filters.gender)
      .filter((p) => !filters.city?.trim() || (p.address?.city || '').toLowerCase() === filters.city.trim().toLowerCase())
      .filter((p) => minCompletion === null || p.completion >= minCompletion)
      .filter((p) => {
        if (!filters.dateFrom && !filters.dateTo) return true
        const date = toDate(p.system?.submittedAt)
        if (!date) return false
        if (filters.dateFrom && date < new Date(filters.dateFrom)) return false
        if (filters.dateTo && date > new Date(`${filters.dateTo}T23:59:59.999`)) return false
        return true
      })
      .filter((p) => {
        if (!term) return true
        return [p.personal?.fullName, p.id, p.userPhone, p.userEmail, p.address?.city, p.userId].some((field) =>
          String(field || '').toLowerCase().includes(term)
        )
      })
      .sort((a, b) => (toDate(b.system?.submittedAt)?.getTime() || 0) - (toDate(a.system?.submittedAt)?.getTime() || 0))
  }, [enrichedProfiles, searchTerm, filters])

  const hasMore = filteredProfiles.length > page * pageSize
  const pageProfiles = filteredProfiles.slice((page - 1) * pageSize, page * pageSize)

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
    profiles: pageProfiles,
    totalCount: filteredProfiles.length,
    loading: loading || users.loading,
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
