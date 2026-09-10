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

export function useDashboardData() {
  const users = useFirestoreCollection('users')
  const subscriptions = useFirestoreCollection('user-subscriptions')
  const payments = useFirestoreCollection('payments')
  const changeRequests = useFirestoreCollection('profile-change-requests')
  const newApprovals = useFirestoreCollection('new-profile-approvals')

  const loading =
    users.loading ||
    subscriptions.loading ||
    payments.loading ||
    changeRequests.loading ||
    newApprovals.loading

  const error =
    users.error ||
    subscriptions.error ||
    payments.error ||
    changeRequests.error ||
    newApprovals.error

  const stats = useMemo(() => {
    const successfulPaymentsToday = payments.data.filter(
      (payment) => payment.status === 'success' && isToday(payment.paymentDate)
    )

    const pendingNewCount = newApprovals.data.filter(
      (profile) => profile.status === 'pending_approval' || profile.system?.status === 'pending_approval'
    ).length

    const pendingChangeCount = changeRequests.data.filter(
      (request) => request.status === 'pending'
    ).length

    return {
      totalUsers: users.data.length,
      premiumUsers: users.data.filter((user) => user.isPremium).length,
      blockedUsers: users.data.filter((user) => user.status === 'blocked').length,
      todaysRevenue: successfulPaymentsToday.reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0
      ),
      newRegistrationsToday: users.data.filter((user) => isToday(user.createdAt)).length,
      maleUsers: users.data.filter((user) => user.gender === 'male').length,
      femaleUsers: users.data.filter((user) => user.gender === 'female').length,
      pendingNewProfiles: pendingNewCount,
      pendingProfileChanges: pendingChangeCount,
      expiringSubscriptions: subscriptions.data.filter(
        (sub) => sub.expiryDate && isWithinNextDays(sub.expiryDate, EXPIRING_WINDOW_DAYS)
      ).length,
      expiredSubscriptions: subscriptions.data.filter(
        (sub) => sub.expiryDate && isPast(sub.expiryDate)
      ).length,
      totalPayments: payments.data.length,
      totalSubscriptions: subscriptions.data.length,
    }
  }, [users.data, subscriptions.data, payments.data, changeRequests.data, newApprovals.data])

  const charts = useMemo(() => {
    const buckets = buildMonthBuckets()
    const successfulPayments = payments.data.filter((payment) => payment.status === 'success')

    return {
      registration: countByMonth(users.data, 'createdAt', buckets).map(({ month, count }) => ({
        month,
        registrations: count,
      })),
      revenue: sumByMonth(successfulPayments, 'paymentDate', 'amount', buckets).map(
        ({ month, total }) => ({ month, revenue: total })
      ),
      gender: [
        { name: 'Male', value: stats.maleUsers },
        { name: 'Female', value: stats.femaleUsers },
      ],
      subscription: [
        { name: 'Premium', value: stats.premiumUsers },
        { name: 'Free', value: Math.max(stats.totalUsers - stats.premiumUsers, 0) },
      ],
    }
  }, [users.data, payments.data, stats])

  return { loading, error, stats, charts }
}