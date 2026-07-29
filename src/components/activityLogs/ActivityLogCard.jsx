import { ScrollText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/common/EmptyState'
import ActivityBadge from '@/components/activityLogs/ActivityBadge'
import { formatDate } from '@/utils/helpers'

// Mobile equivalent of ActivityLogTable.jsx.
export default function ActivityLogCard({ logs, loading, onView }) {
  return (
    <div className="animate-in fade-in space-y-3 duration-500 md:hidden">
      {loading ? (
        Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28 w-full rounded-xl" />)
      ) : logs.length === 0 ? (
        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-6">
            <EmptyState
              icon={ScrollText}
              title="No activity yet"
              description="Admin actions across the panel will appear here as they happen."
            />
          </CardContent>
        </Card>
      ) : (
        logs.map((log) => (
          <Card
            key={log.id}
            className="cursor-pointer border-border/70 shadow-sm active:bg-muted/40"
            role="button"
            tabIndex={0}
            onClick={() => onView(log)}
          >
            <CardContent className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{log.adminName || '—'}</p>
                  <p className="truncate text-xs text-muted-foreground">{log.module}</p>
                </div>
                <ActivityBadge action={log.action} />
              </div>

              <p className="line-clamp-2 text-sm text-foreground">{log.description || '—'}</p>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="capitalize">{log.targetType || '—'}</span>
                <span>{formatDate(log.createdAt)}</span>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
