import { CalendarPlus, CheckCircle2, Clock, RotateCcw, XCircle } from 'lucide-react'
import { formatDate } from '@/utils/helpers'
import { cn } from '@/lib/utils'

const EVENT_META = {
  created: { label: 'Created', icon: CalendarPlus, className: 'bg-muted text-muted-foreground' },
  pending: { label: 'Pending', icon: Clock, className: 'bg-secondary/20 text-secondary-foreground' },
  success: { label: 'Success', icon: CheckCircle2, className: 'bg-success/10 text-success' },
  refunded: { label: 'Refunded', icon: RotateCcw, className: 'bg-orange-500/10 text-orange-600' },
  failed: { label: 'Failed', icon: XCircle, className: 'bg-destructive/10 text-destructive' },
  cancelled: { label: 'Cancelled', icon: XCircle, className: 'bg-muted text-muted-foreground' },
}

export default function PaymentTimeline({ timeline = [] }) {
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
              <p className="text-xs text-muted-foreground">{formatDate(entry.date)}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
