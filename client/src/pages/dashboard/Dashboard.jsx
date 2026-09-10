import { Link } from 'react-router-dom'
import { CircleAlert, ClipboardCheck, Crown, UserCheck, UserPlus, Users, Wallet } from 'lucide-react'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import StatCard from '@/components/dashboard/StatCard'
import RegistrationChart from '@/components/dashboard/Charts/RegistrationChart'
import RevenueChart from '@/components/dashboard/Charts/RevenueChart'
import GenderPieChart from '@/components/dashboard/Charts/GenderPieChart'
import SubscriptionPieChart from '@/components/dashboard/Charts/SubscriptionPieChart'
import { useDashboardData } from '@/hooks/useDashboardData'
import { formatCurrency, toPercent } from '@/utils/helpers'

const NO_DATA = 'No data available'

const PRIMARY_STAT_LINKS = {
  'New Profile Approvals': '/profiles/new-approvals',
  'Pending Profile Changes': '/profiles/change-approvals',
}

export default function Dashboard() {
  const { loading, error, stats, charts } = useDashboardData()

  const primaryStats = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      subtitle: stats.totalUsers === 0 ? NO_DATA : `+${stats.newRegistrationsToday} today`,
      icon: Users,
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
      title: "Today's Revenue",
      value: formatCurrency(stats.todaysRevenue),
      subtitle: stats.totalPayments === 0 ? NO_DATA : 'from successful payments',
      icon: Wallet,
      accent: 'success',
    },
    {
      title: 'New Registrations',
      value: stats.newRegistrationsToday,
      subtitle: stats.totalUsers === 0 ? NO_DATA : 'users registered today',
      icon: UserPlus,
      accent: 'primary',
    },
    {
      title: 'New Profile Approvals',
      value: stats.pendingNewProfiles,
      subtitle: stats.pendingNewProfiles === 0 ? 'No new profiles awaiting review' : 'awaiting admin review',
      icon: UserCheck,
      accent: 'secondary',
    },
    {
      title: 'Pending Profile Changes',
      value: stats.pendingProfileChanges,
      subtitle: stats.pendingProfileChanges === 0 ? 'No changes awaiting review' : 'awaiting admin review',
      icon: ClipboardCheck,
      accent: 'secondary',
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
          <span>Couldn&apos;t load live dashboard data. Check your connection and server URL in .env.</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {primaryStats.map((stat) => {
          const linkTo = PRIMARY_STAT_LINKS[stat.title]
          return linkTo ? (
            <Link key={stat.title} to={linkTo} className="block">
              <StatCard {...stat} loading={loading} />
            </Link>
          ) : (
            <StatCard key={stat.title} {...stat} loading={loading} />
          )
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RegistrationChart data={charts.registration} loading={loading} />
        <RevenueChart data={charts.revenue} loading={loading} />
        <GenderPieChart data={charts.gender} loading={loading} />
        <SubscriptionPieChart data={charts.subscription} loading={loading} />
      </div>
    </div>
  )
}