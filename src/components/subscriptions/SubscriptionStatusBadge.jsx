import { cn } from '@/lib/utils'

const STATUS_STYLES = {
  active: 'bg-success/10 text-success',
  inactive: 'bg-muted text-muted-foreground',
}

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
