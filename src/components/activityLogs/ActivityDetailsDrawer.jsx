import { Link } from 'react-router-dom'
import { ExternalLink, Laptop, MapPin, Smartphone, Tablet } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import ActivityBadge from '@/components/activityLogs/ActivityBadge'
import { formatDate } from '@/utils/helpers'

const DEVICE_ICONS = { Mobile: Smartphone, Tablet: Tablet, Desktop: Laptop }

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate text-right font-medium text-foreground">{value ?? '—'}</span>
    </div>
  )
}

function DataBlock({ title, data }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground uppercase">{title}</p>
      {data ? (
        <pre className="max-h-48 overflow-auto rounded-lg bg-muted/60 p-3 text-xs whitespace-pre-wrap text-foreground">
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : (
        <p className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">Not recorded</p>
      )}
    </div>
  )
}

/** Quick-view drawer for a single log entry, opened from the list's Eye
 * action. ActivityLogDetails.jsx (the full page) is one click further, via
 * "Open Full Details" below — mirrors how Payments' drawer/full-page pairs work. */
export default function ActivityDetailsDrawer({ log, open, onOpenChange }) {
  const DeviceIcon = DEVICE_ICONS[log?.device] || Laptop

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="font-heading text-lg">Activity Log Details</SheetTitle>
          <SheetDescription>Full record of this admin action.</SheetDescription>
        </SheetHeader>

        {log && (
          <div className="space-y-6 px-4 pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <ActivityBadge action={log.action} />
              <span className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</span>
            </div>

            <p className="text-sm text-foreground">{log.description}</p>

            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground uppercase">Admin Information</p>
              <Row label="Name" value={log.adminName} />
              <Row label="Role" value={log.adminRole} />
              <Row label="Admin ID" value={log.adminId} />
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground uppercase">Target Information</p>
              <Row label="Module" value={log.module} />
              <Row label="Target Type" value={log.targetType} />
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground uppercase">Device Information</p>
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
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DataBlock title="Old Values" data={log.oldData} />
              <DataBlock title="New Values" data={log.newData} />
            </div>

            <Button asChild variant="outline" className="w-full gap-1.5">
              <Link to={`/activity-logs/${log.id}`}>
                <ExternalLink className="size-4" aria-hidden="true" />
                Open Full Details
              </Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
