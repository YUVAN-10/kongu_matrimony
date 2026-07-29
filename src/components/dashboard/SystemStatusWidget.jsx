import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

function StatusRow({ label, connected, value }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      {typeof connected === 'boolean' ? (
        <span
          className={cn(
            'flex items-center gap-1.5 text-xs font-medium',
            connected ? 'text-success' : 'text-destructive'
          )}
        >
          <span
            className={cn('size-1.5 rounded-full', connected ? 'bg-success' : 'bg-destructive')}
            aria-hidden="true"
          />
          {connected ? 'Connected' : 'Disconnected'}
        </span>
      ) : (
        <span className="truncate text-xs font-medium text-foreground capitalize">
          {value || '—'}
        </span>
      )}
    </div>
  )
}

/**
 * Reuses state that already exists elsewhere (auth context, the Dashboard's
 * own fetch error) — this widget makes no Firestore calls of its own.
 * "Storage" and "Firebase" reflect that the SDK initialized successfully,
 * not a live network ping (adding one would mean a new Storage read, which
 * is out of scope for a status widget).
 */
export default function SystemStatusWidget({ firestoreError }) {
  const { currentAdmin } = useAuth()

  return (
    <Card className="animate-in fade-in border-border/70 shadow-sm duration-500">
      <CardHeader>
        <CardTitle className="font-heading text-lg text-foreground">System Status</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border/60">
        <StatusRow label="Firebase" connected />
        <StatusRow label="Firestore" connected={!firestoreError} />
        <StatusRow label="Storage" connected />
        <StatusRow label="Authentication" connected={Boolean(currentAdmin)} />
        <StatusRow label="Logged In Admin" value={currentAdmin?.name || currentAdmin?.email} />
        <StatusRow label="Role" value={currentAdmin?.role?.replace('_', ' ')} />
      </CardContent>
    </Card>
  )
}
