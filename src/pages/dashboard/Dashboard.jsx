import {
  Ban,
  CalendarX,
  CircleAlert,
  Clock,
  Crown,
  Eye,
  EyeOff,
  Mars,
  UserPlus,
  UserRound,
  Users,
  Venus,
  Wallet,
} from 'lucide-react'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import StatCard from '@/components/dashboard/StatCard'
import QuickActions from '@/components/dashboard/QuickActions'
import RecentActivity from '@/components/dashboard/RecentActivity'
import SystemStatusWidget from '@/components/dashboard/SystemStatusWidget'
import RecentProfilesTable from '@/components/dashboard/RecentProfilesTable'
import RecentPaymentsTable from '@/components/dashboard/RecentPaymentsTable'
import RegistrationChart from '@/components/dashboard/Charts/RegistrationChart'
import RevenueChart from '@/components/dashboard/Charts/RevenueChart'
import GenderPieChart from '@/components/dashboard/Charts/GenderPieChart'
import SubscriptionPieChart from '@/components/dashboard/Charts/SubscriptionPieChart'
import { useDashboardData } from '@/hooks/useDashboardData'
import { formatCurrency, toPercent } from '@/utils/helpers'

const NO_DATA = 'No data available'

export default function Dashboard() {
  const { loading, error, stats, charts, recentProfiles, recentPayments, recentActivity } =
    useDashboardData()

  const primaryStats = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      subtitle: stats.totalUsers === 0 ? NO_DATA : `+${stats.newRegistrationsToday} today`,
      icon: Users,
      accent: 'primary',
    },
    {
      title: 'Total Profiles',
      value: stats.totalProfiles,
      subtitle: stats.totalProfiles === 0 ? NO_DATA : `${stats.activeProfiles} active`,
      icon: UserRound,
      accent: 'primary',
    },
    {
      title: 'Premium Users',
      value: stats.premiumUsers,
      subtitle:
        stats.totalUsers === 0
          ? NO_DATA
          : `${toPercent(stats.premiumUsers, stats.totalUsers)}% of all users`,
      icon: Crown,
      accent: 'secondary',
    },
    {
      title: 'Blocked Users',
      value: stats.blockedUsers,
      subtitle:
        stats.totalUsers === 0
          ? NO_DATA
          : stats.blockedUsers === 0
            ? 'All accounts active'
            : `${toPercent(stats.blockedUsers, stats.totalUsers)}% of all users`,
      icon: Ban,
      accent: 'destructive',
    },
    {
      title: "Today's Revenue",
      value: formatCurrency(stats.todaysRevenue),
      subtitle: stats.totalPayments === 0 ? NO_DATA : 'from successful payments',
      icon: Wallet,
      accent: 'success',
    },
    {
      title: 'New Registrations Today',
      value: stats.newRegistrationsToday,
      subtitle: stats.totalProfiles === 0 ? NO_DATA : 'profiles created today',
      icon: UserPlus,
      accent: 'primary',
    },
  ]

  const secondaryStats = [
    {
      title: 'Male Profiles',
      value: stats.maleProfiles,
      subtitle:
        stats.totalProfiles === 0
          ? NO_DATA
          : `${toPercent(stats.maleProfiles, stats.totalProfiles)}% of profiles`,
      icon: Mars,
      accent: 'primary',
    },
    {
      title: 'Female Profiles',
      value: stats.femaleProfiles,
      subtitle:
        stats.totalProfiles === 0
          ? NO_DATA
          : `${toPercent(stats.femaleProfiles, stats.totalProfiles)}% of profiles`,
      icon: Venus,
      accent: 'secondary',
    },
    {
      title: 'Active Profiles',
      value: stats.activeProfiles,
      subtitle:
        stats.totalProfiles === 0
          ? NO_DATA
          : `${toPercent(stats.activeProfiles, stats.totalProfiles)}% of profiles`,
      icon: Eye,
      accent: 'success',
    },
    {
      title: 'Hidden Profiles',
      value: stats.hiddenProfiles,
      subtitle:
        stats.totalProfiles === 0
          ? NO_DATA
          : `${toPercent(stats.hiddenProfiles, stats.totalProfiles)}% of profiles`,
      icon: EyeOff,
      accent: 'primary',
    },
    {
      title: 'Expiring Subscriptions',
      value: stats.expiringSubscriptions,
      subtitle: stats.totalSubscriptions === 0 ? NO_DATA : 'within 7 days',
      icon: Clock,
      accent: 'secondary',
    },
    {
      title: 'Expired Subscriptions',
      value: stats.expiredSubscriptions,
      subtitle: stats.totalSubscriptions === 0 ? NO_DATA : 'needs renewal',
      icon: CalendarX,
      accent: 'destructive',
    },
  ]

  return (
    <div>
      <DashboardHeader />

      {error && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>Couldn&apos;t load live dashboard data. Check your connection and try again.</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-6">
        {primaryStats.map((stat) => (
          <StatCard key={stat.title} {...stat} loading={loading} />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-6">
        {secondaryStats.map((stat) => (
          <StatCard key={stat.title} {...stat} loading={loading} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RegistrationChart data={charts.registration} loading={loading} />
        <RevenueChart data={charts.revenue} loading={loading} />
        <GenderPieChart data={charts.gender} loading={loading} />
        <SubscriptionPieChart data={charts.subscription} loading={loading} />
      </div>

      <div className="mt-6">
        <QuickActions />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <RecentActivity activity={recentActivity} loading={loading} />
        <SystemStatusWidget firestoreError={error} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <RecentProfilesTable profiles={recentProfiles} loading={loading} />
        <RecentPaymentsTable payments={recentPayments} loading={loading} />
      </div>
    </div>
  )
}
