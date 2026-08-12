import { Gem } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/common/EmptyState'
import SubscriptionStatusBadge from '@/components/subscriptions/SubscriptionStatusBadge'
import SubscriptionActionMenu from '@/components/subscriptions/SubscriptionActionMenu'
import { formatCurrency, formatDate } from '@/utils/helpers'
import { cn } from '@/lib/utils'

const COLUMN_COUNT = 7

// Desktop/tablet table. See SubscriptionCard.jsx for the mobile equivalent.
// No pagination footer — subscription plans are small, admin-curated
// catalog data (a handful to a few dozen), unlike Users/Profiles.
export default function SubscriptionTable({
  plans,
  loading,
  activeUserCounts,
  onView,
  onEdit,
  onActivate,
  onDeactivate,
}) {
  return (
    <Card className="animate-in fade-in hidden border-border/70 shadow-sm duration-500 md:block">
      <CardHeader>
        <CardTitle className="font-heading text-lg text-foreground">All Plans</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase">
              <th className="px-4 py-3 font-medium">Plan Name</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Duration</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Active Users</th>
              <th className="px-4 py-3 font-medium">Created Date</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <tr key={index} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3" colSpan={COLUMN_COUNT}>
                    <Skeleton className="h-8 w-full" />
                  </td>
                </tr>
              ))
            ) : plans.length === 0 ? (
              <tr>
                <td colSpan={COLUMN_COUNT} className="px-4 py-6">
                  <EmptyState
                    icon={Gem}
                    title="No plans found"
                    description="Subscription plans you create will appear here."
                  />
                </td>
              </tr>
            ) : (
              plans.map((plan) => (
                <tr
                  key={plan.id}
                  className={cn(
                    'border-b border-border/60 last:border-0 hover:bg-muted/40',
                    plan.status === 'inactive' && 'bg-muted/20'
                  )}
                >
                  <td className="px-4 py-3 font-medium text-foreground">{plan.planName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatCurrency(plan.price)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{plan.durationDays} days</td>
                  <td className="px-4 py-3">
                    <SubscriptionStatusBadge status={plan.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {activeUserCounts[plan.id] ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(plan.createdAt)}</td>
                  <td className="px-4 py-3">
                    <SubscriptionActionMenu
                      plan={plan}
                      onView={onView}
                      onEdit={onEdit}
                      onActivate={onActivate}
                      onDeactivate={onDeactivate}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}