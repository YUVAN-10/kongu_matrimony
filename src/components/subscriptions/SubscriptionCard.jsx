import { Gem } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/common/EmptyState'
import SubscriptionStatusBadge from '@/components/subscriptions/SubscriptionStatusBadge'
import SubscriptionActionMenu from '@/components/subscriptions/SubscriptionActionMenu'
import { SUBSCRIPTION_FEATURES } from '@/constants/subscriptionOptions'
import { formatCurrency } from '@/utils/helpers'
import { cn } from '@/lib/utils'

// Mobile equivalent of SubscriptionTable.jsx — a premium showcase card
// instead of a wide table, per the "use premium cards" design brief.
export default function SubscriptionCard({
  plans,
  loading,
  activeUserCounts,
  onView,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}) {
  return (
    <div className="animate-in fade-in space-y-3 duration-500 md:hidden">
      {loading ? (
        Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-40 w-full rounded-xl" />)
      ) : plans.length === 0 ? (
        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-6">
            <EmptyState
              icon={Gem}
              title="No plans found"
              description="Subscription plans you create will appear here."
            />
          </CardContent>
        </Card>
      ) : (
        plans.map((plan) => {
          const enabledFeatures = SUBSCRIPTION_FEATURES.filter((feature) => plan.features?.[feature.key])
          const preview = enabledFeatures.slice(0, 3)

          return (
            <Card
              key={plan.id}
              className={cn(
                'overflow-hidden border-border/70 shadow-sm',
                plan.status === 'inactive' && 'opacity-70'
              )}
            >
              <div className="flex items-center justify-between bg-gradient-to-r from-primary to-primary/80 px-4 py-3 text-primary-foreground">
                <div>
                  <p className="font-heading text-base font-semibold">{plan.planName}</p>
                  <p className="text-xs opacity-90">{plan.durationDays} days</p>
                </div>
                <p className="font-heading text-xl font-bold">{formatCurrency(plan.price)}</p>
              </div>

              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <SubscriptionStatusBadge status={plan.status} />
                  <SubscriptionActionMenu
                    plan={plan}
                    onView={onView}
                    onEdit={onEdit}
                    onActivate={onActivate}
                    onDeactivate={onDeactivate}
                    onDelete={onDelete}
                  />
                </div>

                {preview.length > 0 && (
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {preview.map((feature) => (
                      <li key={feature.key}>✓ {feature.label}</li>
                    ))}
                    {enabledFeatures.length > preview.length && (
                      <li>+{enabledFeatures.length - preview.length} more</li>
                    )}
                  </ul>
                )}

                <p className="text-xs text-muted-foreground">
                  {activeUserCounts[plan.id] ?? '—'} active user(s)
                </p>
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}
