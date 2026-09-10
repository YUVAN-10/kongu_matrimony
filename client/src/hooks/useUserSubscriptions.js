import { useEffect, useMemo, useState } from 'react'
import { subscribeToSubscriptions } from '@/services/userSubscriptionService'
import { getUserById } from '@/services/userService'
import { getProfileById } from '@/services/profileService'
import { getEffectiveSubscriptionStatus, isWithinNextDays, toDate, endOfDay } from '@/utils/helpers'
import { EXPIRY_ALERT_WINDOW_DAYS } from '@/constants/userSubscriptionOptions'
import { subscribeWithRetry } from '@/utils/subscribeWithRetry'

const DEFAULT_FILTERS = {
  status: '',
  paymentStatus: '',
  planId: '',
  purchaseDateFrom: '',
  purchaseDateTo: '',
  expiryDateFrom: '',
  expiryDateTo: '',
}

/**
 * Realtime subscription list, enriched with joined user/profile data and
 * client-side search/filter/dashboard-aggregate computation.
 *
 * Like Subscription Plans, this subscribes to the whole `subscriptions`
 * collection rather than cursor-paginating — no pagination was requested
 * for this module. Unlike plans, this collection *can* grow large (roughly
 * one document per user), so if that becomes a real concern, the natural
 * upgrade is the same cursor-pagination pattern used by useUsers.js.
 *
 * The join: subscription documents only store userId/profileId (not
 * denormalized name/photo), matching the spec's "fetch ... from users
 * collection" / "fetch ... from profiles collection" wording literally.
 * So after every snapshot, the unique user/profile IDs referenced by the
 * current list are batch-fetched once (not one onSnapshot listener per
 * row) and cached in a map keyed by ID.
 */
export function useUserSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([])
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
      subscribeToSubscriptions,
      (data) => {
        setSubscriptions(data)
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
    if (subscriptions.length === 0) {
      setUserMap({})
      setProfileMap({})
      return
    }
    let cancelled = false
    const userIds = [...new Set(subscriptions.map((sub) => sub.userId).filter(Boolean))]
    const profileIds = [...new Set(subscriptions.map((sub) => sub.profileId).filter(Boolean))]

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
  }, [subscriptions])

  const enriched = useMemo(
    () =>
      subscriptions.map((sub) => ({
        ...sub,
        effectiveStatus: getEffectiveSubscriptionStatus(sub),
        user: userMap[sub.userId] ?? null,
        profile: profileMap[sub.profileId] ?? null,
        profileDeleted: sub.profileId ? profileMap[sub.profileId] === null : false,
      })),
    [subscriptions, userMap, profileMap]
  )

  const filteredSubscriptions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    return enriched
      .filter((sub) => !filters.status || sub.effectiveStatus === filters.status)
      .filter((sub) => !filters.paymentStatus || sub.paymentStatus === filters.paymentStatus)
      .filter((sub) => !filters.planId || sub.planId === filters.planId)
      .filter((sub) => {
        if (!filters.purchaseDateFrom && !filters.purchaseDateTo) return true
        const purchase = toDate(sub.purchaseDate)
        if (!purchase) return false
        if (filters.purchaseDateFrom && purchase < new Date(filters.purchaseDateFrom)) return false
        if (filters.purchaseDateTo && purchase > endOfDay(new Date(filters.purchaseDateTo))) return false
        return true
      })
      .filter((sub) => {
        if (!filters.expiryDateFrom && !filters.expiryDateTo) return true
        const expiry = toDate(sub.expiryDate)
        if (!expiry) return false
        if (filters.expiryDateFrom && expiry < new Date(filters.expiryDateFrom)) return false
        if (filters.expiryDateTo && expiry > endOfDay(new Date(filters.expiryDateTo))) return false
        return true
      })
      .filter((sub) => {
        if (!term) return true
        return [sub.user?.name, sub.user?.phone, sub.user?.email, sub.profileId].some((field) =>
          String(field || '').toLowerCase().includes(term)
        )
      })
      .sort((a, b) => (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0))
  }, [enriched, searchTerm, filters])

  const dashboardStats = useMemo(() => {
    const active = enriched.filter((sub) => sub.effectiveStatus === 'active')
    const expired = enriched.filter((sub) => sub.effectiveStatus === 'expired')
    const cancelled = enriched.filter((sub) => sub.effectiveStatus === 'cancelled')
    const revenue = enriched
      .filter((sub) => sub.paymentStatus === 'paid')
      .reduce((sum, sub) => sum + Number(sub.amount || 0), 0)
    const expiringSoon = active.filter((sub) => isWithinNextDays(sub.expiryDate, EXPIRY_ALERT_WINDOW_DAYS))

    return {
      totalActive: active.length,
      totalExpired: expired.length,
      totalCancelled: cancelled.length,
      revenue,
      expiringWithin7Days: expiringSoon.length,
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
    subscriptions: filteredSubscriptions,
    totalCount: subscriptions.length,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filters,
    updateFilters,
    resetFilters,
    dashboardStats,
  }
}
