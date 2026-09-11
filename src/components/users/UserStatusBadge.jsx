import { cn } from '@/lib/utils'

const STATUS_STYLES = {
  active: 'bg-success/15 text-success font-semibold border border-success/30',
  blocked: 'bg-destructive/15 text-destructive font-semibold border border-destructive/30',
  deleted: 'bg-muted text-muted-foreground',
}

export default function UserStatusBadge({ status }) {
  const normalized = (status || 'active').toLowerCase()
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider',
        STATUS_STYLES[normalized] || 'bg-muted text-muted-foreground'
      )}
    >
      {status || 'UNKNOWN'}
    </span>
  )
}
