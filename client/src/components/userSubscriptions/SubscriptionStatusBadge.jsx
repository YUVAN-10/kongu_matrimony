import { cn } from '@/lib/utils'

const STATUS_STYLES = {
  active: 'bg-success/10 text-success',
  expired: 'bg-destructive/10 text-destructive',
  cancelled: 'bg-muted text-muted-foreground',
  pending: 'bg-secondary/20 text-secondary-foreground',
}

// Expects the *effective* status (see utils/helpers.getEffectiveSubscriptionStatus),
// not necessarily the raw stored value — nothing auto-flips status to
// "expired" in the database, so callers must derive it before badging.
export default function SubscriptionStatusBadge({ status }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
        STATUS_STYLES[status] || 'bg-muted text-muted-foreground'
      )}
    >
      {status || 'unknown'}
    </span>
  )
}
