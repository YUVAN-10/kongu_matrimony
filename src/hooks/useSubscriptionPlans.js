import { useEffect, useMemo, useState } from 'react'
import { useFirestoreCollection } from '@/hooks/useFirestoreCollection'
import { getAssignedUserCount } from '@/services/subscriptionService'
import { toDate } from '@/utils/helpers'

/**
 * Subscription plans are admin-curated catalog data, not an unbounded,
 * user-generated collection like Users or Profiles — realistically a
 * handful to a few dozen documents. That changes the right architecture:
 * a single onSnapshot on the whole collection (reusing the same generic
 * hook the Dashboard uses) with search/filter/sort computed client-side,
 * rather than the cursor-pagination + capped-search-mode split used for
 * Users/Profiles. No pagination was requested here either.
 */
export function useSubscriptionPlans() {
  const { data: plans, loading, error } = useFirestoreCollection('subscriptionPlans')

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [activeUserCounts, setActiveUserCounts] = useState({})

  // Assignment counts aren't part of the realtime plan snapshot (they live
  // in a different collection), so they're fetched once per plan whenever
  // the plan list changes — a reasonable refresh cadence for a secondary,
  // non-critical metric rather than N extra realtime listeners.
  useEffect(() => {
    if (plans.length === 0) {
      setActiveUserCounts({})
      return
    }
    let cancelled = false
    Promise.all(plans.map((plan) => getAssignedUserCount(plan.id).then((count) => [plan.id, count])))
      .then((entries) => {
        if (!cancelled) setActiveUserCounts(Object.fromEntries(entries))
      })
      .catch(() => {
        // Non-critical — the table just shows "—" if counts fail to load.
      })
    return () => {
      cancelled = true
    }
  }, [plans])

  const filteredPlans = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return plans
      .filter((plan) => !statusFilter || plan.status === statusFilter)
      .filter((plan) => !term || (plan.planName || '').toLowerCase().includes(term))
      .sort((a, b) => (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0))
  }, [plans, searchTerm, statusFilter])

  return {
    plans: filteredPlans,
    totalPlanCount: plans.length,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    activeUserCounts,
  }
}
