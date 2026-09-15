import { Gem } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/common/EmptyState'
import SubscriptionStatusBadge from '@/components/subscriptions/SubscriptionStatusBadge'
import SubscriptionActionMenu from '@/components/subscriptions/SubscriptionActionMenu'
import { formatCurrency } from '@/utils/helpers'
import { cn } from '@/lib/utils'

export default function SubscriptionCard({
  plans,
  loading,
  activeUserCounts = {},
  onView,
  onEdit,
  onActivate,
  onDeactivate,
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
          const isPlanActive = plan.isActive !== false
          const featureList = Array.isArray(plan.features) ? plan.features : []
          const preview = featureList.slice(0, 3)

          return (
            <Card
              key={plan.code || plan.id}
              className={cn(
                'overflow-hidden border-border/70 shadow-sm transition-all',
                !isPlanActive && 'opacity-75'
              )}
            >
              <div className="flex items-center justify-between bg-gradient-to-r from-primary to-primary/80 px-4 py-3 text-primary-foreground">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-heading text-base font-semibold">{plan.name || plan.planName}</p>
                    <Badge variant="secondary" className="bg-white/20 text-white border-none font-mono text-[10px]">
                      {plan.code}
                    </Badge>
                  </div>
                  <p className="text-xs opacity-90">{plan.validityDays ?? plan.durationDays} days</p>
                </div>
                <p className="font-heading text-xl font-bold">
                  {plan.price === 0 ? 'Free' : formatCurrency(plan.price)}
                </p>
              </div>

              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <SubscriptionStatusBadge status={isPlanActive ? 'active' : 'inactive'} />
                  <SubscriptionActionMenu
                    plan={plan}
                    onView={onView}
                    onEdit={onEdit}
                    onActivate={onActivate}
                    onDeactivate={onDeactivate}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg">
                  <div>
                    Contacts: <span className="font-medium text-foreground">{plan.contactQuota ?? 'Unlimited'}</span>
                  </div>
                  <div>
                    Search: <span className="font-medium text-foreground">{plan.searchResultLimit ?? 'Unlimited'}</span>
                  </div>
                  <div>
                    Photos: <span className="font-medium text-foreground">{plan.photoLimit ?? 5}</span>
                  </div>
                  <div>
                    Active Users: <span className="font-medium text-foreground">{activeUserCounts[plan.code || plan.id] ?? 0}</span>
                  </div>
                </div>

                {preview.length > 0 && (
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {preview.map((feature, idx) => (
                      <li key={idx} className="truncate">✓ {feature}</li>
                    ))}
                    {featureList.length > preview.length && (
                      <li className="text-primary font-medium">+{featureList.length - preview.length} more features</li>
                    )}
                  </ul>
                )}
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}

