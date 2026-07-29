import { useState } from 'react'
import { CircleAlert, Download, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ActivityLogSummaryCards from '@/components/activityLogs/ActivityLogSummaryCards'
import ActivityLogFilters from '@/components/activityLogs/ActivityLogFilters'
import ActivityLogTable from '@/components/activityLogs/ActivityLogTable'
import ActivityLogCard from '@/components/activityLogs/ActivityLogCard'
import ActivityDetailsDrawer from '@/components/activityLogs/ActivityDetailsDrawer'
import { useActivityLogs } from '@/hooks/useActivityLogs'
import { exportActivityLogsToCsv, exportActivityLogsToExcel } from '@/services/activityLogService'

export default function ActivityLogs() {
  const {
    logs,
    totalCount,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filters,
    updateFilters,
    resetFilters,
    adminOptions,
    summary,
  } = useActivityLogs()

  const [selectedLog, setSelectedLog] = useState(null)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Activity Logs</h1>
          <p className="text-sm text-muted-foreground">
            A complete, permanent audit trail of every action admins take across the panel.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => exportActivityLogsToCsv(logs)} disabled={logs.length === 0} className="gap-1.5">
            <Download className="size-4" aria-hidden="true" />
            CSV
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => exportActivityLogsToExcel(logs)} disabled={logs.length === 0} className="gap-1.5">
            <FileSpreadsheet className="size-4" aria-hidden="true" />
            Excel
          </Button>
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>Couldn&apos;t load activity logs. Check your connection and try again.</span>
        </div>
      )}

      <ActivityLogSummaryCards summary={summary} loading={loading} />

      <ActivityLogFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        onChange={updateFilters}
        onReset={resetFilters}
        adminOptions={adminOptions}
      />

      {!loading && totalCount > 0 && (
        <p className="text-xs text-muted-foreground">
          Showing {logs.length} of {totalCount} logged actions.
        </p>
      )}

      <ActivityLogTable logs={logs} loading={loading} onView={setSelectedLog} />
      <ActivityLogCard logs={logs} loading={loading} onView={setSelectedLog} />

      <ActivityDetailsDrawer
        log={selectedLog}
        open={Boolean(selectedLog)}
        onOpenChange={(open) => !open && setSelectedLog(null)}
      />
    </div>
  )
}
