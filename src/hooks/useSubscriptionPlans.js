import { useCallback, useEffect, useMemo, useState } from 'react'
import { getSubscriptionPlans, getAssignedUserCount } from '@/services/subscriptionService'

/**
 * Custom hook to load and manage subscription plans via REST API.
 */
export function useSubscriptionPlans() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [activeUserCounts, setActiveUserCounts] = useState({})

  const fetchPlans = useCallback(async (isMounted = true) => {
    try {
      if (isMounted) {
        setLoading(true)
        setError(null)
      }
      const data = await getSubscriptionPlans()
      if (isMounted) {
        setPlans(data || [])
      }
      return data
    } catch (err) {
      if (isMounted) {
        setError(err)
      }
      return []
    } finally {
      if (isMounted) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    let mounted = true
    fetchPlans(mounted)
    return () => {
      mounted = false
    }
  }, [fetchPlans])

  // Fetch assignment counts per plan
  useEffect(() => {
    if (plans.length === 0) {
      setActiveUserCounts({})
      return
    }
    let cancelled = false
    Promise.all(
      plans.map((plan) =>
        getAssignedUserCount(plan.code || plan.id).then((count) => [plan.code || plan.id, count])
      )
    )
      .then((entries) => {
        if (!cancelled) setActiveUserCounts(Object.fromEntries(entries))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [plans])

  const filteredPlans = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return plans
      .filter((plan) => {
        if (!statusFilter) return true
        if (statusFilter === 'active') return plan.isActive
        if (statusFilter === 'inactive') return !plan.isActive
        return plan.status === statusFilter
      })
      .filter((plan) => {
        if (!term) return true
        const name = (plan.name || plan.planName || '').toLowerCase()
        const code = (plan.code || '').toLowerCase()
        return name.includes(term) || code.includes(term)
      })
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  }, [plans, searchTerm, statusFilter])

  return {
    plans: filteredPlans,
    rawPlans: plans,
    totalPlanCount: plans.length,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    activeUserCounts,
    refetch: () => fetchPlans(true),
  }
}

