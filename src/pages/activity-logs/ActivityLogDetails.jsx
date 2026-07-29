import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CircleAlert, Laptop, MapPin, Smartphone, Tablet } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import ActivityBadge from '@/components/activityLogs/ActivityBadge'
import ActivityTimeline from '@/components/activityLogs/ActivityTimeline'
import { getActivityLogById, getActivityLogsForTarget } from '@/services/activityLogService'
import { formatDate } from '@/utils/helpers'

const DEVICE_ICONS = { Mobile: Smartphone, Tablet: Tablet, Desktop: Laptop }

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium text-foreground">{value ?? '—'}</span>
    </div>
  )
}

function DataBlock({ title, data }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground uppercase">{title}</p>
      {data ? (
        <pre className="max-h-64 overflow-auto rounded-lg bg-muted/60 p-3 text-xs whitespace-pre-wrap text-foreground">
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : (
        <p className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">Not recorded</p>
      )}
    </div>
  )
}

export default function ActivityLogDetails() {
  const { logId } = useParams()

  const [log, setLog] = useState(null)
  const [targetHistory, setTargetHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    getActivityLogById(logId)
      .then(async (data) => {
        if (cancelled) return
        if (!data) {
          setError('Activity log not found.')
          return
        }
        setLog(data)

        if (data.targetType && data.targetId) {
          const history = await getActivityLogsForTarget(data.targetType, data.targetId)
          if (!cancelled) setTargetHistory(history)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not load this activity log.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [logId])

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !log) {
    return (
      <div role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>{error || 'Activity log not found.'}</span>
      </div>
    )
  }

  const DeviceIcon = DEVICE_ICONS[log.device] || Laptop

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">{log.description}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <ActivityBadge action={log.action} />
          <span className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-foreground">Admin Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Name" value={log.adminName} />
            <Row label="Role" value={log.adminRole} />
            <Row label="Admin ID" value={log.adminId} />
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-foreground">Target Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Module" value={log.module} />
            <Row label="Target Type" value={log.targetType} />
            <Row label="Target ID" value={log.targetId} />
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-foreground">Device Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Row
              label="Device"
              value={
                <span className="inline-flex items-center gap-1">
                  <DeviceIcon className="size-3" aria-hidden="true" />
                  {log.device || 'Unknown'}
                </span>
              }
            />
            <Row label="Browser" value={log.browser} />
            <Row
              label="IP Address"
              value={
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3" aria-hidden="true" />
                  {log.ipAddress || 'Not available'}
                </span>
              }
            />
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-foreground">Changed Data</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DataBlock title="Old Values" data={log.oldData} />
            <DataBlock title="New Values" data={log.newData} />
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-foreground">Target History</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityTimeline logs={targetHistory} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
