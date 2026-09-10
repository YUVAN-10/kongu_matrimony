import { BarChart3 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/common/EmptyState'

// Shared shell for every dashboard chart: title + fixed-height plot area
// with consistent loading/empty states, so each chart file only owns its
// data-to-shape mapping and Recharts markup.
export default function ChartCard({
  title,
  loading,
  isEmpty,
  emptyIcon = BarChart3,
  emptyTitle = 'No data yet',
  emptyDescription = 'Data will appear here once available.',
  children,
}) {
  return (
    <Card className="animate-in fade-in border-border/70 shadow-sm duration-500">
      <CardHeader>
        <CardTitle className="font-heading text-lg text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        {loading ? (
          <Skeleton className="h-full w-full" />
        ) : isEmpty ? (
          <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
