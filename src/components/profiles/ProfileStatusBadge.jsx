import { cn } from '@/lib/utils'

// Draft=yellow, Active=green, Hidden=orange, Deleted=red — per the design spec.
const STATUS_STYLES = {
  draft: 'bg-secondary/20 text-secondary-foreground',
  active: 'bg-success/10 text-success',
  hidden: 'bg-orange-500/10 text-orange-600',
  deleted: 'bg-destructive/10 text-destructive',
}

export default function ProfileStatusBadge({ status }) {
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
