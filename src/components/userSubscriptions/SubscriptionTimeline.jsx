import { CalendarPlus, CheckCircle2, RefreshCw, TrendingUp, XCircle } from 'lucide-react'
import { formatDate } from '@/utils/helpers'
import { cn } from '@/lib/utils'

// "Expired" is deliberately not in this map as a loggable event — nothing
// ever writes {event:'expired'} to the timeline, since it's a derived,
// date-based state (see getEffectiveSubscriptionStatus), not a discrete
// admin action. ViewSubscription.jsx surfaces that separately as a badge.
const EVENT_META = {
  created: { label: 'Created', icon: CalendarPlus, className: 'bg-muted text-muted-foreground' },
  activated: { label: 'Activated', icon: CheckCircle2, className: 'bg-success/10 text-success' },
  renewed: { label: 'Renewed', icon: RefreshCw, className: 'bg-primary/10 text-primary' },
  extended: { label: 'Extended', icon: TrendingUp, className: 'bg-secondary/20 text-secondary-foreground' },
  cancelled: { label: 'Cancelled', icon: XCircle, className: 'bg-destructive/10 text-destructive' },
}

export default function SubscriptionTimeline({ timeline = [] }) {
  if (timeline.length === 0) {
    return <p className="text-sm text-muted-foreground">No timeline events yet.</p>
  }

  const sorted = [...timeline].sort(
    (a, b) => (b.date?.toMillis?.() || 0) - (a.date?.toMillis?.() || 0)
  )

  return (
    <ol className="space-y-4">
      {sorted.map((entry, index) => {
        const meta = EVENT_META[entry.event] || EVENT_META.created
        const Icon = meta.icon
        return (
          <li key={index} className="flex gap-3">
            <div
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-full',
                meta.className
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{meta.label}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(entry.date)}
                {entry.note ? ` · ${entry.note}` : ''}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
