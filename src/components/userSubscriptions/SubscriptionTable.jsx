import { AlertTriangle, Gem } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/common/EmptyState'
import SubscriptionStatusBadge from '@/components/userSubscriptions/SubscriptionStatusBadge'
import SubscriptionActionMenu from '@/components/userSubscriptions/SubscriptionActionMenu'
import { formatCurrency, formatDate, getDaysRemaining, isWithinNextDays } from '@/utils/helpers'
import { EXPIRY_ALERT_WINDOW_DAYS, EXPIRY_WARNING_WINDOW_DAYS } from '@/constants/userSubscriptionOptions'
import { cn } from '@/lib/utils'

const COLUMN_COUNT = 10
const PAYMENT_STATUS_STYLES = {
  paid: 'bg-success/10 text-success',
  pending: 'bg-secondary/20 text-secondary-foreground',
  failed: 'bg-destructive/10 text-destructive',
  refunded: 'bg-muted text-muted-foreground',
}

function rowTint(sub) {
  if (sub.effectiveStatus === 'expired') return 'bg-destructive/5'
  if (sub.effectiveStatus === 'active' && isWithinNextDays(sub.expiryDate, EXPIRY_ALERT_WINDOW_DAYS)) {
    return 'bg-orange-500/5'
  }
  if (sub.effectiveStatus === 'active' && isWithinNextDays(sub.expiryDate, EXPIRY_WARNING_WINDOW_DAYS)) {
    return 'bg-secondary/5'
  }
  return ''
}

function DaysRemainingCell({ subscription }) {
  const days = getDaysRemaining(subscription.expiryDate)
  if (subscription.effectiveStatus === 'cancelled' || days === null) {
    return <span className="text-muted-foreground">—</span>
  }
  if (days < 0) {
    return (
      <span className="flex items-center gap-1 text-destructive">
        <AlertTriangle className="size-3.5" aria-hidden="true" />
        {Math.abs(days)}d expired
      </span>
    )
  }
  return <span className={days <= EXPIRY_ALERT_WINDOW_DAYS ? 'font-medium text-orange-600' : ''}>{days}d</span>
}

// Desktop/tablet table. See SubscriptionCard.jsx for the mobile equivalent.
export default function SubscriptionTable({ subscriptions, loading, onView, onRenew, onCancel }) {
  return (
    <Card className="animate-in fade-in hidden border-border/70 shadow-sm duration-500 md:block">
      <CardHeader>
        <CardTitle className="font-heading text-lg text-foreground">All Subscriptions</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase">
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Profile ID</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Purchase Date</th>
              <th className="px-4 py-3 font-medium">Expiry Date</th>
              <th className="px-4 py-3 font-medium">Days Remaining</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={index} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3" colSpan={COLUMN_COUNT}>
                    <Skeleton className="h-8 w-full" />
                  </td>
                </tr>
              ))
            ) : subscriptions.length === 0 ? (
              <tr>
                <td colSpan={COLUMN_COUNT} className="px-4 py-6">
                  <EmptyState
                    icon={Gem}
                    title="No subscriptions found"
                    description="Assign a plan to a user to see it appear here."
                  />
                </td>
              </tr>
            ) : (
              subscriptions.map((sub) => (
                <tr key={sub.id} className={cn('border-b border-border/60 last:border-0 hover:bg-muted/40', rowTint(sub))}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{sub.user?.name || '—'}</p>
                    <p className="text-xs text-muted-foreground">{sub.user?.phone || sub.user?.email || ''}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground" title={sub.profileId}>
                    {sub.profileId ? `${sub.profileId.slice(0, 8)}…` : '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{sub.planName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatCurrency(sub.amount)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(sub.purchaseDate)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(sub.expiryDate)}</td>
                  <td className="px-4 py-3">
                    <DaysRemainingCell subscription={sub} />
                  </td>
                  <td className="px-4 py-3">
                    <SubscriptionStatusBadge status={sub.effectiveStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                        PAYMENT_STATUS_STYLES[sub.paymentStatus] || 'bg-muted text-muted-foreground'
                      )}
                    >
                      {sub.paymentStatus || 'unknown'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {sub.effectiveStatus === 'expired' && (
                        <Button type="button" size="sm" variant="outline" onClick={() => onRenew(sub)} className="h-7 px-2 text-xs">
                          Renew
                        </Button>
                      )}
                      <SubscriptionActionMenu
                        subscription={sub}
                        onView={onView}
                        onRenew={onRenew}
                        onCancel={onCancel}
                      />
                    </div>
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
