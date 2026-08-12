import { cn } from '@/lib/utils'

// Pending=yellow, Approved=green, Rejected=red — same palette as ProfileStatusBadge.
const STATUS_STYLES = {
  pending: 'bg-secondary/20 text-secondary-foreground',
  approved: 'bg-success/10 text-success',
  rejected: 'bg-destructive/10 text-destructive',
}

export default function ChangeRequestStatusBadge({ status }) {
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
