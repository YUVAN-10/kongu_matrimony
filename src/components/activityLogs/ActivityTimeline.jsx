import ActivityBadge from '@/components/activityLogs/ActivityBadge'
import { formatDate, toDate } from '@/utils/helpers'

/** Chronological history of activities — used by ActivityLogDetails.jsx to
 * show every logged action against one target (e.g. one user's full history). */
export default function ActivityTimeline({ logs = [] }) {
  if (logs.length === 0) {
    return <p className="text-sm text-muted-foreground">No history recorded for this target yet.</p>
  }

  const sorted = [...logs].sort((a, b) => (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0))

  return (
    <ol className="space-y-4">
      {sorted.map((log) => (
        <li key={log.id} className="flex gap-3 border-l-2 border-border/70 pb-1 pl-4 last:pb-0">
          <div className="-ml-[21px] mt-1 size-2.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <ActivityBadge action={log.action} />
              <span className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</span>
            </div>
            <p className="text-sm text-foreground">{log.description}</p>
            <p className="text-xs text-muted-foreground">by {log.adminName || 'Admin'}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
