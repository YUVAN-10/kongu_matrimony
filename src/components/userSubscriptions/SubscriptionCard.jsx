import { Gem } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/common/EmptyState'
import SubscriptionStatusBadge from '@/components/userSubscriptions/SubscriptionStatusBadge'
import SubscriptionActionMenu from '@/components/userSubscriptions/SubscriptionActionMenu'
import { formatCurrency, formatDate, getDaysRemaining } from '@/utils/helpers'
import { cn } from '@/lib/utils'

// Mobile equivalent of SubscriptionTable.jsx.
export default function SubscriptionCard({ subscriptions, loading, onView, onRenew, onCancel }) {
  return (
    <div className="animate-in fade-in space-y-3 duration-500 md:hidden">
      {loading ? (
        Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-32 w-full rounded-xl" />)
      ) : subscriptions.length === 0 ? (
        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-6">
            <EmptyState
              icon={Gem}
              title="No subscriptions found"
              description="Assign a plan to a user to see it appear here."
            />
          </CardContent>
        </Card>
      ) : (
        subscriptions.map((sub) => {
          const days = getDaysRemaining(sub.expiryDate)
          return (
            <Card
              key={sub.id}
              className={cn(
                'border-border/70 shadow-sm',
                sub.effectiveStatus === 'expired' && 'border-destructive/30 bg-destructive/5'
              )}
            >
              <CardContent className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{sub.user?.name || '—'}</p>
                    <p className="truncate text-xs text-muted-foreground">{sub.planName}</p>
                  </div>
                  <SubscriptionActionMenu
                    subscription={sub}
                    onView={onView}
                    onRenew={onRenew}
                    onCancel={onCancel}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <SubscriptionStatusBadge status={sub.effectiveStatus} />
                  <span className="text-xs text-muted-foreground">{formatCurrency(sub.amount)}</span>
                  <span className="text-xs text-muted-foreground">
                    {sub.effectiveStatus === 'cancelled' || days === null
                      ? ''
                      : days < 0
                        ? `${Math.abs(days)}d expired`
                        : `${days}d remaining`}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">
                  {formatDate(sub.purchaseDate)} → {formatDate(sub.expiryDate)}
                </p>

                {sub.effectiveStatus === 'expired' && (
                  <Button type="button" size="sm" variant="outline" onClick={() => onRenew(sub)} className="w-full">
                    Renew
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}
