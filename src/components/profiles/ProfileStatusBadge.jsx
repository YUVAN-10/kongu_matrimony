import { cn } from '@/lib/utils'

// Draft=yellow, Pending Approval=blue, Active=green, Hidden=orange,
// Rejected/Deleted=red — per the design spec.
const STATUS_STYLES = {
  draft: 'bg-secondary/20 text-secondary-foreground',
  pending_approval: 'bg-blue-500/10 text-blue-600',
  active: 'bg-success/10 text-success',
  hidden: 'bg-orange-500/10 text-orange-600',
  rejected: 'bg-destructive/10 text-destructive',
  deleted: 'bg-destructive/10 text-destructive',
}

const STATUS_LABELS = {
  pending_approval: 'Pending Approval',
}

export default function ProfileStatusBadge({ status }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
        STATUS_STYLES[status] || 'bg-muted text-muted-foreground'
      )}
    >
      {STATUS_LABELS[status] || status || 'unknown'}
    </span>
  )
}
