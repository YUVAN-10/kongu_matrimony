import { Eye, ScrollText } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/common/EmptyState'
import ActivityBadge from '@/components/activityLogs/ActivityBadge'
import { formatDate } from '@/utils/helpers'

const COLUMN_COUNT = 8

// Desktop/tablet table. See ActivityLogCard.jsx for the mobile equivalent.
export default function ActivityLogTable({ logs, loading, onView }) {
  return (
    <Card className="animate-in fade-in hidden border-border/70 shadow-sm duration-500 md:block">
      <CardHeader>
        <CardTitle className="font-heading text-lg text-foreground">All Activity</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase">
              <th className="px-4 py-3 font-medium">Date &amp; Time</th>
              <th className="px-4 py-3 font-medium">Admin</th>
              <th className="px-4 py-3 font-medium">Module</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Target</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">IP Address</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={index} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3" colSpan={COLUMN_COUNT}>
                    <Skeleton className="h-8 w-full" />
                  </td>
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={COLUMN_COUNT} className="px-4 py-6">
                  <EmptyState
                    icon={ScrollText}
                    title="No activity yet"
                    description="Admin actions across the panel will appear here as they happen."
                  />
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-border/60 last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{formatDate(log.createdAt)}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{log.adminName || '—'}</p>
                    <p className="text-xs text-muted-foreground capitalize">{log.adminRole || ''}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{log.module}</td>
                  <td className="px-4 py-3">
                    <ActivityBadge action={log.action} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{log.targetType || '—'}</td>
                  <td className="px-4 py-3 max-w-xs truncate text-foreground" title={log.description}>
                    {log.description || '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {log.ipAddress || 'Not available'}
                  </td>
                  <td className="px-4 py-3">
                    <Button type="button" variant="ghost" size="icon" aria-label="View log" onClick={() => onView(log)}>
                      <Eye className="size-4" aria-hidden="true" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
