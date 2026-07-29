import { Receipt } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/common/EmptyState'
import { formatCurrency, formatDate } from '@/utils/helpers'
import { cn } from '@/lib/utils'

const STATUS_STYLES = {
  success: 'bg-success/10 text-success',
  pending: 'bg-secondary/20 text-secondary-foreground',
  failed: 'bg-destructive/10 text-destructive',
}

export default function RecentPaymentsTable({ payments, loading }) {
  return (
    <Card className="animate-in fade-in border-border/70 shadow-sm duration-500">
      <CardHeader>
        <CardTitle className="font-heading text-lg text-foreground">Recent Payments</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase">
              <th className="px-5 py-3 font-medium">Transaction ID</th>
              <th className="px-5 py-3 font-medium">User</th>
              <th className="px-5 py-3 font-medium">Plan</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-3" colSpan={6}>
                    <Skeleton className="h-8 w-full" />
                  </td>
                </tr>
              ))
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-6">
                  <EmptyState
                    icon={Receipt}
                    title="No payments yet"
                    description="Payment transactions will appear here once processed."
                  />
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-b border-border/60 last:border-0 hover:bg-muted/40"
                >
                  <td className="px-5 py-3 font-mono text-xs text-foreground">
                    {payment.transactionId || payment.id}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {payment.userName || payment.userId || '—'}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{payment.planName || '—'}</td>
                  <td className="px-5 py-3 font-medium text-foreground">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                        STATUS_STYLES[payment.status] || 'bg-muted text-muted-foreground'
                      )}
                    >
                      {payment.status || 'unknown'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {formatDate(payment.paymentDate)}
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
