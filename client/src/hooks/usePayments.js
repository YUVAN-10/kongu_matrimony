import { useEffect, useMemo, useState } from 'react'
import { subscribeToPayments } from '@/services/paymentService'
import { getUserById } from '@/services/userService'
import { getProfileById } from '@/services/profileService'
import { toDate, isToday, endOfDay } from '@/utils/helpers'
import { subscribeWithRetry } from '@/utils/subscribeWithRetry'

const DEFAULT_FILTERS = {
  status: '',
  paymentMethod: '',
  gateway: '',
  planId: '',
  dateFrom: '',
  dateTo: '',
}

function isThisMonth(value) {
  const date = toDate(value)
  if (!date) return false
  const now = new Date()
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
}

/**
 * Realtime payment list, enriched with joined user/profile data, plus
 * client-side search/filter/summary-aggregate computation. Architecturally
 * identical to useUserSubscriptions.js — same whole-collection subscribe
 * (no pagination requested), same batch-join-by-ID-after-snapshot pattern.
 */
export function usePayments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userMap, setUserMap] = useState({})
  const [profileMap, setProfileMap] = useState({})

  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const unsubscribe = subscribeWithRetry(
      subscribeToPayments,
      (data) => {
        setPayments(data)
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      }
    )
    return unsubscribe
  }, [])

  useEffect(() => {
    if (payments.length === 0) {
      setUserMap({})
      setProfileMap({})
      return
    }
    let cancelled = false
    const userIds = [...new Set(payments.map((payment) => payment.userId).filter(Boolean))]
    const profileIds = [...new Set(payments.map((payment) => payment.profileId).filter(Boolean))]

    Promise.all([
      Promise.all(userIds.map((id) => getUserById(id).then((data) => [id, data]))),
      Promise.all(profileIds.map((id) => getProfileById(id).then((data) => [id, data]))),
    ])
      .then(([userEntries, profileEntries]) => {
        if (cancelled) return
        setUserMap(Object.fromEntries(userEntries))
        setProfileMap(Object.fromEntries(profileEntries))
      })
      .catch(() => {
        // Non-critical — rows just show "—" for user/profile info if this fails.
      })

    return () => {
      cancelled = true
    }
  }, [payments])

  const enriched = useMemo(
    () =>
      payments.map((payment) => ({
        ...payment,
        user: userMap[payment.userId] ?? null,
        profile: profileMap[payment.profileId] ?? null,
      })),
    [payments, userMap, profileMap]
  )

  const filteredPayments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    return enriched
      .filter((payment) => !filters.status || payment.status === filters.status)
      .filter((payment) => !filters.paymentMethod || payment.paymentMethod === filters.paymentMethod)
      .filter((payment) => !filters.gateway || payment.gateway === filters.gateway)
      .filter((payment) => !filters.planId || payment.planId === filters.planId)
      .filter((payment) => {
        if (!filters.dateFrom && !filters.dateTo) return true
        const date = toDate(payment.paymentDate)
        if (!date) return false
        if (filters.dateFrom && date < new Date(filters.dateFrom)) return false
        if (filters.dateTo && date > endOfDay(new Date(filters.dateTo))) return false
        return true
      })
      .filter((payment) => {
        if (!term) return true
        return [
          payment.transactionId,
          payment.user?.name,
          payment.user?.phone,
          payment.user?.email,
          payment.profileId,
        ].some((field) => String(field || '').toLowerCase().includes(term))
      })
      .sort((a, b) => (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0))
  }, [enriched, searchTerm, filters])

  const summary = useMemo(() => {
    const successful = enriched.filter((payment) => payment.status === 'success')
    return {
      totalRevenue: successful.reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
      todaysRevenue: successful
        .filter((payment) => isToday(payment.paymentDate))
        .reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
      monthRevenue: successful
        .filter((payment) => isThisMonth(payment.paymentDate))
        .reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
      pendingCount: enriched.filter((payment) => payment.status === 'pending').length,
      failedCount: enriched.filter((payment) => payment.status === 'failed').length,
      refundedCount: enriched.filter((payment) => payment.status === 'refunded').length,
    }
  }, [enriched])

  function updateFilters(patch) {
    setFilters((prev) => ({ ...prev, ...patch }))
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS)
    setSearchTerm('')
  }

  return {
    payments: filteredPayments,
    totalCount: payments.length,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filters,
    updateFilters,
    resetFilters,
    summary,
  }
}
