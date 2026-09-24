import { cn } from '@/lib/utils'

const STATUS_STYLES = {
  active: 'bg-success/15 text-success font-semibold border border-success/30',
  draft: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/30',
  incomplete: 'bg-muted text-muted-foreground font-semibold border border-border',
  blocked: 'bg-destructive/15 text-destructive font-semibold border border-destructive/30',
  deleted: 'bg-muted text-muted-foreground',
}

export default function UserStatusBadge({ status, profileStatus }) {
  const isBlocked = status?.toUpperCase() === 'BLOCKED'
  const effectiveStatus = isBlocked
    ? 'blocked'
    : (profileStatus || status || 'active').toLowerCase()

  const displayLabel = isBlocked
    ? 'BLOCKED'
    : profileStatus === 'DRAFT'
    ? 'DRAFT PROFILE'
    : profileStatus === 'ACTIVE'
    ? 'ACTIVE'
    : status || 'ACTIVE'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider',
        STATUS_STYLES[effectiveStatus] || 'bg-muted text-muted-foreground'
      )}
    >
      {displayLabel}
    </span>
  )
}
