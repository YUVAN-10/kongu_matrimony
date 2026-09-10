import { cn } from '@/lib/utils'

const STATUS_STYLES = {
  pending: 'bg-secondary/20 text-secondary-foreground',
  success: 'bg-success/10 text-success',
  failed: 'bg-destructive/10 text-destructive',
  refunded: 'bg-orange-500/10 text-orange-600',
  cancelled: 'bg-muted text-muted-foreground',
}

export default function PaymentStatusBadge({ status }) {
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
