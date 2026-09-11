import { Link } from 'react-router-dom'
import {
  Users,
  UserCheck,
  UserX,
  FileText,
  CreditCard,
  Crown,
  CircleAlert,
  RefreshCw,
  Mail,
  Phone,
  ArrowRight,
} from 'lucide-react'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import StatCard from '@/components/dashboard/StatCard'
import GenderPieChart from '@/components/dashboard/Charts/GenderPieChart'
import { useDashboardData } from '@/hooks/useDashboardData'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatRelativeTime } from '@/utils/helpers'

const PRIMARY_STAT_LINKS = {
  'Total Users': '/users',
  'Active Users': '/users',
  'Blocked Users': '/users',
  'Total Profiles': '/users',
  'Active Subscriptions': '/subscriptions/users',
  'Pending Payments': '/payments',
}

export default function Dashboard() {
  const { loading, error, stats, recentUsers, charts, refetch } = useDashboardData()

  const primaryStats = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      accent: 'primary',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: UserCheck,
      accent: 'success',
    },
    {
      title: 'Blocked Users',
      value: stats.blockedUsers,
      icon: UserX,
      accent: stats.blockedUsers > 0 ? 'destructive' : 'secondary',
    },
    {
      title: 'Total Profiles',
      value: stats.totalProfiles,
      icon: FileText,
      accent: 'primary',
    },
    {
      title: 'Active Subscriptions',
      value: stats.activeSubscriptions,
      icon: Crown,
      accent: 'secondary',
    },
    {
      title: 'Pending Payments',
      value: stats.pendingPayments,
      icon: CreditCard,
      accent: stats.pendingPayments > 0 ? 'destructive' : 'success',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <DashboardHeader />
        <Button
          variant="outline"
          size="sm"
          onClick={refetch}
          disabled={loading}
          className="self-start sm:self-auto"
        >
          <RefreshCw className={`mr-2 size-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Stats
        </Button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <p className="font-medium">Couldn&apos;t load live dashboard data</p>
            <p className="text-xs text-destructive/80">{error}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={refetch} className="h-7 text-xs text-destructive hover:bg-destructive/20">
            Retry
          </Button>
        </div>
      )}

      {/* 6 Metric Stat Cards Grid */}
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

      {/* Visualizations & Recent Users from endpoint */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Gender Distribution Pie Chart */}
        <div className="lg:col-span-5">
          <GenderPieChart data={charts.gender} loading={loading} />
        </div>

        {/* Recent Users List from endpoint data */}
        <div className="lg:col-span-7">
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="font-heading text-lg text-foreground">Recent Users</CardTitle>
              <Link
                to="/users"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                View all <ArrowRight className="size-3.5" />
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="size-10 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : recentUsers.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No recent users found.</p>
              ) : (
                <div className="divide-y divide-border/50">
                  {recentUsers.map((user) => {
                    const initials = (user.name || user.email || 'U')
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()

                    const isPremium = user.profile?.isPremium || false
                    const status = (user.status || 'ACTIVE').toUpperCase()
                    const gender = (user.gender || '').toUpperCase()

                    return (
                      <div key={user.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar className="size-10 border border-border">
                            <AvatarImage src={user.profile?.profileImageUrl} alt={user.name} />
                            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                              {initials}
                            </AvatarFallback>
                          </Avatar>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="truncate text-sm font-medium text-foreground">{user.name || 'Unnamed'}</p>
                              {isPremium && (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                                  <Crown className="size-3" />
                                  Premium
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                              {user.email && (
                                <span className="inline-flex items-center gap-1 truncate">
                                  <Mail className="size-3 shrink-0" />
                                  {user.email}
                                </span>
                              )}
                              {user.mobile && (
                                <span className="inline-flex items-center gap-1 truncate">
                                  <Phone className="size-3 shrink-0" />
                                  {user.mobile}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <div className="flex items-center gap-1.5">
                            {gender && (
                              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                {gender}
                              </span>
                            )}
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                status === 'ACTIVE'
                                  ? 'bg-success/10 text-success'
                                  : 'bg-destructive/10 text-destructive'
                              }`}
                            >
                              {status}
                            </span>
                          </div>
                          <span className="text-[11px] text-muted-foreground">
                            {formatRelativeTime(user.createdAt)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}