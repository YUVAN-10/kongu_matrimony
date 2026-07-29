import { useEffect, useMemo, useState } from 'react'
import { subscribeToActivityLogs } from '@/services/activityLogService'
import { toDate } from '@/utils/helpers'
import { subscribeWithRetry } from '@/utils/subscribeWithRetry'

const DEFAULT_FILTERS = {
  module: '',
  action: '',
  adminId: '',
  dateFrom: '',
  dateTo: '',
}

function startOfDay(date) {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  return start
}

function startOfWeek(date) {
  const start = startOfDay(date)
  const day = start.getDay()
  start.setDate(start.getDate() - day)
  return start
}

function startOfMonth(date) {
  const start = startOfDay(date)
  start.setDate(1)
  return start
}

/**
 * Realtime activity log feed plus client-side search/filter/summary
 * computation — architecturally identical to usePayments.js (whole-
 * collection subscribe, no pagination, derive everything else in memory).
 */
export function useActivityLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const unsubscribe = subscribeWithRetry(
      subscribeToActivityLogs,
      (data) => {
        setLogs(data)
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      }
    )
    return unsubscribe
  }, [])

  // Admin filter options, derived from the logs themselves — there is no
  // dedicated admins-list service, and every admin who has ever acted
  // already shows up here.
  const adminOptions = useMemo(() => {
    const seen = new Map()
    for (const log of logs) {
      if (log.adminId && !seen.has(log.adminId)) {
        seen.set(log.adminId, log.adminName || log.adminId)
      }
    }
    return [...seen.entries()].map(([value, label]) => ({ value, label }))
  }, [logs])

  const filteredLogs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    return logs
      .filter((log) => !filters.module || log.module === filters.module)
      .filter((log) => !filters.action || log.action === filters.action)
      .filter((log) => !filters.adminId || log.adminId === filters.adminId)
      .filter((log) => {
        if (!filters.dateFrom && !filters.dateTo) return true
        const date = toDate(log.createdAt)
        if (!date) return false
        if (filters.dateFrom && date < new Date(filters.dateFrom)) return false
        if (filters.dateTo && date > new Date(`${filters.dateTo}T23:59:59.999`)) return false
        return true
      })
      .filter((log) => {
        if (!term) return true
        return [log.adminName, log.targetId, log.description].some((field) =>
          String(field || '').toLowerCase().includes(term)
        )
      })
      .sort((a, b) => (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0))
  }, [logs, searchTerm, filters])

  const summary = useMemo(() => {
    const now = new Date()
    const todayStart = startOfDay(now)
    const weekStart = startOfWeek(now)
    const monthStart = startOfMonth(now)

    const todayCount = logs.filter((log) => (toDate(log.createdAt)?.getTime() || 0) >= todayStart.getTime()).length
    const weekCount = logs.filter((log) => (toDate(log.createdAt)?.getTime() || 0) >= weekStart.getTime()).length
    const monthCount = logs.filter((log) => (toDate(log.createdAt)?.getTime() || 0) >= monthStart.getTime()).length

    const adminCounts = new Map()
    const moduleCounts = new Map()
    for (const log of logs) {
      const adminKey = log.adminName || 'Unknown'
      adminCounts.set(adminKey, (adminCounts.get(adminKey) || 0) + 1)
      const moduleKey = log.module || 'Unknown'
      moduleCounts.set(moduleKey, (moduleCounts.get(moduleKey) || 0) + 1)
    }

    const mostActiveAdmin = [...adminCounts.entries()].sort((a, b) => b[1] - a[1])[0]
    const mostActiveModule = [...moduleCounts.entries()].sort((a, b) => b[1] - a[1])[0]

    return {
      todayCount,
      weekCount,
      monthCount,
      mostActiveAdmin: mostActiveAdmin ? mostActiveAdmin[0] : '—',
      mostActiveModule: mostActiveModule ? mostActiveModule[0] : '—',
    }
  }, [logs])

  function updateFilters(patch) {
    setFilters((prev) => ({ ...prev, ...patch }))
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS)
    setSearchTerm('')
  }

  return {
    logs: filteredLogs,
    totalCount: logs.length,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filters,
    updateFilters,
    resetFilters,
    adminOptions,
    summary,
  }
}
