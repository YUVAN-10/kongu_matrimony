import { useMemo } from 'react'
import { useFirestoreCollection } from '@/hooks/useFirestoreCollection'
import { toDate, isToday, isPast, isWithinNextDays } from '@/utils/helpers'

const MONTHS_BACK = 6
const EXPIRING_WINDOW_DAYS = 7

function buildMonthBuckets() {
  const now = new Date()
  return Array.from({ length: MONTHS_BACK }, (_, index) => {
    const offset = MONTHS_BACK - 1 - index
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    return { label: date.toLocaleDateString('en-IN', { month: 'short' }), date }
  })
}

/** Reads a possibly-nested field via a dot path, e.g. "system.createdAt". */
function getField(record, path) {
  return path.split('.').reduce((value, key) => value?.[key], record)
}

function countByMonth(records, dateField, buckets) {
  return buckets.map(({ label, date }) => ({
    month: label,
    count: records.filter((record) => {
      const recordDate = toDate(getField(record, dateField))
      return (
        recordDate &&
        recordDate.getFullYear() === date.getFullYear() &&
        recordDate.getMonth() === date.getMonth()
      )
    }).length,
  }))
}

function sumByMonth(records, dateField, amountField, buckets) {
  return buckets.map(({ label, date }) => ({
    month: label,
    total: records
      .filter((record) => {
        const recordDate = toDate(getField(record, dateField))
        return (
          recordDate &&
          recordDate.getFullYear() === date.getFullYear() &&
          recordDate.getMonth() === date.getMonth()
        )
      })
      .reduce((sum, record) => sum + Number(getField(record, amountField) || 0), 0),
  }))
}

function sortByNewest(records, dateField) {
  return [...records].sort(
    (a, b) =>
      (toDate(getField(b, dateField))?.getTime() || 0) - (toDate(getField(a, dateField))?.getTime() || 0)
  )
}

/**
 * Aggregates the four Firestore collections the Dashboard needs into stats,
 * chart series, and "recent" lists. Each collection is subscribed to exactly
 * once (via useFirestoreCollection); the same in-memory snapshot is reused
 * for both aggregate counts and the "latest 5" tables, instead of running a
 * second orderBy/limit query per collection.
 */
export function useDashboardData() {
  const users = useFirestoreCollection('users')
  const profiles = useFirestoreCollection('profiles')
  const subscriptions = useFirestoreCollection('subscriptions')
  const payments = useFirestoreCollection('payments')
  const activityLogs = useFirestoreCollection('activityLogs')

  const loading =
    users.loading ||
    profiles.loading ||
    subscriptions.loading ||
    payments.loading ||
    activityLogs.loading
  const error =
    users.error || profiles.error || subscriptions.error || payments.error || activityLogs.error

  const stats = useMemo(() => {
    // paymentDate (the actual transaction date), not createdAt (the record's
    // write timestamp) — a manually-entered payment can be backdated, so
    // revenue should be attributed to when it was actually paid.
    const successfulPaymentsToday = payments.data.filter(
      (payment) => payment.status === 'success' && isToday(payment.paymentDate)
    )

    return {
      totalUsers: users.data.length,
      totalProfiles: profiles.data.length,
      premiumUsers: users.data.filter((user) => user.isPremium).length,
      blockedUsers: users.data.filter((user) => user.status === 'blocked').length,
      todaysRevenue: successfulPaymentsToday.reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0
      ),
      newRegistrationsToday: profiles.data.filter((profile) => isToday(profile.system?.createdAt))
        .length,
      maleProfiles: profiles.data.filter((profile) => profile.personal?.gender === 'male').length,
      femaleProfiles: profiles.data.filter((profile) => profile.personal?.gender === 'female').length,
      activeProfiles: profiles.data.filter((profile) => profile.system?.status === 'active').length,
      hiddenProfiles: profiles.data.filter((profile) => profile.system?.status === 'hidden').length,
      expiringSubscriptions: subscriptions.data.filter(
        (sub) => sub.expiryDate && isWithinNextDays(sub.expiryDate, EXPIRING_WINDOW_DAYS)
      ).length,
      expiredSubscriptions: subscriptions.data.filter(
        (sub) => sub.expiryDate && isPast(sub.expiryDate)
      ).length,
      // Raw collection sizes, used by StatCard subtitles to distinguish a
      // genuinely empty collection ("No data available") from a metric
      // that's legitimately zero (e.g. 0 blocked users out of 50).
      totalPayments: payments.data.length,
      totalSubscriptions: subscriptions.data.length,
    }
  }, [users.data, profiles.data, subscriptions.data, payments.data])

  const charts = useMemo(() => {
    const buckets = buildMonthBuckets()
    const successfulPayments = payments.data.filter((payment) => payment.status === 'success')

    return {
      registration: countByMonth(profiles.data, 'system.createdAt', buckets).map(({ month, count }) => ({
        month,
        registrations: count,
      })),
      revenue: sumByMonth(successfulPayments, 'paymentDate', 'amount', buckets).map(
        ({ month, total }) => ({ month, revenue: total })
      ),
      gender: [
        { name: 'Male', value: stats.maleProfiles },
        { name: 'Female', value: stats.femaleProfiles },
      ],
      subscription: [
        { name: 'Premium', value: stats.premiumUsers },
        { name: 'Free', value: Math.max(stats.totalUsers - stats.premiumUsers, 0) },
      ],
    }
  }, [profiles.data, payments.data, stats])

  const recentProfiles = useMemo(
    () => sortByNewest(profiles.data, 'system.createdAt').slice(0, 5),
    [profiles.data]
  )

  const recentPayments = useMemo(
    () => sortByNewest(payments.data, 'createdAt').slice(0, 5),
    [payments.data]
  )

  const recentActivity = useMemo(
    () => sortByNewest(activityLogs.data, 'createdAt').slice(0, 5),
    [activityLogs.data]
  )

  return { loading, error, stats, charts, recentProfiles, recentPayments, recentActivity }
}
