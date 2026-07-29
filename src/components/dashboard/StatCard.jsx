import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const ACCENT_STYLES = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/20 text-secondary-foreground',
  success: 'bg-success/10 text-success',
  destructive: 'bg-destructive/10 text-destructive',
}

export default function StatCard({ title, value, subtitle, icon: Icon, accent = 'primary', loading }) {
  return (
    <Card className="min-h-[100px] border-border/70 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex h-full items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0 space-y-0.5">
          <p className="truncate text-xs font-medium text-muted-foreground">{title}</p>
          {loading ? (
            <Skeleton className="h-6 w-16" />
          ) : (
            <p className="truncate font-heading text-xl font-semibold text-foreground">{value}</p>
          )}
          {!loading && subtitle && (
            <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-xl',
            ACCENT_STYLES[accent]
          )}
        >
          <Icon className="size-[18px]" aria-hidden="true" />
        </div>
      </CardContent>
    </Card>
  )
}
