import { useState, useEffect, useCallback, useMemo } from 'react'
import { getDashboardStats } from '@/services/dashboardService'

export function useDashboardData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getDashboardStats()
      setData(result)
    } catch (err) {
      console.error('Failed to load dashboard stats:', err)
      setError(err?.message || 'Failed to fetch dashboard statistics')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const stats = useMemo(() => {
    const rawStats = data?.stats || {}
    const genderDist = rawStats.genderDistribution || {}

    return {
      totalUsers: rawStats.totalUsers ?? 0,
      activeUsers: rawStats.activeUsers ?? 0,
      blockedUsers: rawStats.blockedUsers ?? 0,
      totalProfiles: rawStats.totalProfiles ?? 0,
      pendingPayments: rawStats.pendingPayments ?? 0,
      activeSubscriptions: rawStats.activeSubscriptions ?? 0,
      maleUsers: genderDist.male ?? 0,
      femaleUsers: genderDist.female ?? 0,
    }
  }, [data])

  const recentUsers = useMemo(() => {
    return data?.recentUsers || []
  }, [data])

  const charts = useMemo(() => {
    const male = stats.maleUsers
    const female = stats.femaleUsers
    const totalGender = male + female

    const activeUsers = stats.activeUsers
    const blockedUsers = stats.blockedUsers

    return {
      gender: [
        { name: 'Male', value: male },
        { name: 'Female', value: female },
      ],
      userStatus: [
        { name: 'Active', value: activeUsers },
        { name: 'Blocked', value: blockedUsers },
      ],
      subscription: [
        { name: 'Active Subscribed', value: stats.activeSubscriptions },
        { name: 'Regular', value: Math.max(stats.totalUsers - stats.activeSubscriptions, 0) },
      ],
      hasGenderData: totalGender > 0,
    }
  }, [stats])

  return {
    loading,
    error,
    stats,
    recentUsers,
    charts,
    refetch: fetchStats,
  }
}