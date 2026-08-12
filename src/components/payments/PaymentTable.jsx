import { Receipt } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/common/EmptyState'
import PaymentStatusBadge from '@/components/payments/PaymentStatusBadge'
import PaymentMethodBadge from '@/components/payments/PaymentMethodBadge'
import PaymentActionMenu from '@/components/payments/PaymentActionMenu'
import { formatCurrency, formatDate } from '@/utils/helpers'
import { cn } from '@/lib/utils'

const COLUMN_COUNT = 9

// Desktop/tablet table. See PaymentCard.jsx for the mobile equivalent.
export default function PaymentTable({ payments, loading, onView, onMarkSuccess, onMarkFailed, onRetry, onCancel, onRefund }) {
  return (
    <Card className="animate-in fade-in hidden border-border/70 shadow-sm duration-500 md:block">
      <CardHeader>
        <CardTitle className="font-heading text-lg text-foreground">All Payments</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase">
              <th className="px-4 py-3 font-medium">Transaction ID</th>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Method</th>
              <th className="px-4 py-3 font-medium">Gateway</th>
              <th className="px-4 py-3 font-medium">Payment Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
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
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={COLUMN_COUNT} className="px-4 py-6">
                  <EmptyState
                    icon={Receipt}
                    title="No payments found"
                    description="Payments recorded for user subscriptions will appear here."
                  />
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr
                  key={payment.id}
                  className={cn(
                    'border-b border-border/60 last:border-0 hover:bg-muted/40',
                    payment.status === 'failed' && 'bg-destructive/5'
                  )}
                >
                  <td className="px-4 py-3 font-mono text-xs text-foreground">
                    {payment.transactionId || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{payment.user?.name || '—'}</p>
                    <p className="text-xs text-muted-foreground">{payment.user?.phone || payment.user?.email || ''}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{payment.planName}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{formatCurrency(payment.amount)}</td>
                  <td className="px-4 py-3">
                    <PaymentMethodBadge method={payment.paymentMethod} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{payment.gateway}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(payment.paymentDate)}</td>
                  <td className="px-4 py-3">
                    <PaymentStatusBadge status={payment.status} />
                  </td>
                  <td className="px-4 py-3">
                    <PaymentActionMenu
                      payment={payment}
                      onView={onView}
                      onMarkSuccess={onMarkSuccess}
                      onMarkFailed={onMarkFailed}
                      onRetry={onRetry}
                      onCancel={onCancel}
                      onRefund={onRefund}
                    />
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
