import { Gem } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/common/EmptyState'
import SubscriptionStatusBadge from '@/components/subscriptions/SubscriptionStatusBadge'
import SubscriptionActionMenu from '@/components/subscriptions/SubscriptionActionMenu'
import { formatCurrency, formatDate } from '@/utils/helpers'
import { cn } from '@/lib/utils'

const COLUMN_COUNT = 8

export default function SubscriptionTable({
  plans,
  loading,
  activeUserCounts = {},
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
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Plan Name</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Validity</th>
              <th className="px-4 py-3 font-medium">Quotas</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Active Users</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
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
              plans.map((plan) => {
                const isPlanActive = plan.isActive !== false
                return (
                  <tr
                    key={plan.code || plan.id}
                    className={cn(
                      'border-b border-border/60 last:border-0 hover:bg-muted/40 transition-colors',
                      !isPlanActive && 'bg-muted/20 opacity-75'
                    )}
                  >
                    <td className="px-4 py-3 font-mono font-medium text-foreground">
                      <Badge variant="outline" className="font-mono text-xs font-semibold">
                        {plan.code}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{plan.name || plan.planName}</div>
                      {Array.isArray(plan.features) && plan.features.length > 0 && (
                        <div className="text-xs text-muted-foreground truncate max-w-xs">
                          {plan.features.slice(0, 2).join(' · ')}
                          {plan.features.length > 2 && ` +${plan.features.length - 2} more`}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {plan.price === 0 ? <Badge variant="secondary">Free</Badge> : formatCurrency(plan.price)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {plan.validityDays ?? plan.durationDays} days
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      <div>
                        Contacts:{' '}
                        <span className="font-medium text-foreground">
                          {plan.contactQuota !== null && plan.contactQuota !== undefined ? plan.contactQuota : 'Unlimited'}
                        </span>
                      </div>
                      <div>
                        Search:{' '}
                        <span className="font-medium text-foreground">
                          {plan.searchResultLimit ? `${plan.searchResultLimit} profiles` : 'Unlimited'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <SubscriptionStatusBadge status={isPlanActive ? 'active' : 'inactive'} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {activeUserCounts[plan.code || plan.id] ?? '0'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <SubscriptionActionMenu
                        plan={plan}
                        onView={onView}
                        onEdit={onEdit}
                        onActivate={onActivate}
                        onDeactivate={onDeactivate}
                      />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}