import { Activity } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/common/EmptyState'
import ActivityBadge from '@/components/activityLogs/ActivityBadge'
import { formatRelativeTime } from '@/utils/helpers'

export default function RecentActivity({ activity, loading }) {
  return (
    <Card className="animate-in fade-in border-border/70 shadow-sm duration-500">
      <CardHeader>
        <CardTitle className="font-heading text-lg text-foreground">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : activity.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No activity yet"
            description="Admin actions like creating profiles or processing payments will show up here."
          />
        ) : (
          <ul className="space-y-4">
            {activity.map((entry) => (
              <li key={entry.id} className="flex items-start gap-3">
                <ActivityBadge action={entry.action} className="mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">
                    {entry.description || 'Activity recorded'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.adminName ? `${entry.adminName} · ` : ''}
                    {formatRelativeTime(entry.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
