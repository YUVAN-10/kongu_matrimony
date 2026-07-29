import { Receipt } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/common/EmptyState'
import PaymentStatusBadge from '@/components/payments/PaymentStatusBadge'
import PaymentMethodBadge from '@/components/payments/PaymentMethodBadge'
import PaymentActionMenu from '@/components/payments/PaymentActionMenu'
import { formatCurrency, formatDate } from '@/utils/helpers'
import { cn } from '@/lib/utils'

// Mobile equivalent of PaymentTable.jsx.
export default function PaymentCard({ payments, loading, onView, onMarkSuccess, onMarkFailed, onRetry, onCancel, onRefund }) {
  return (
    <div className="animate-in fade-in space-y-3 duration-500 md:hidden">
      {loading ? (
        Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-32 w-full rounded-xl" />)
      ) : payments.length === 0 ? (
        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-6">
            <EmptyState
              icon={Receipt}
              title="No payments found"
              description="Payments recorded for user subscriptions will appear here."
            />
          </CardContent>
        </Card>
      ) : (
        payments.map((payment) => (
          <Card
            key={payment.id}
            className={cn('border-border/70 shadow-sm', payment.status === 'failed' && 'border-destructive/30 bg-destructive/5')}
          >
            <CardContent className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {payment.transactionId || payment.id}
                  </p>
                  <p className="truncate font-medium text-foreground">{payment.user?.name || '—'}</p>
                  <p className="truncate text-xs text-muted-foreground">{payment.planName}</p>
                </div>
                <PaymentActionMenu
                  payment={payment}
                  onView={onView}
                  onMarkSuccess={onMarkSuccess}
                  onMarkFailed={onMarkFailed}
                  onRetry={onRetry}
                  onCancel={onCancel}
                  onRefund={onRefund}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <PaymentStatusBadge status={payment.status} />
                <PaymentMethodBadge method={payment.paymentMethod} />
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatDate(payment.paymentDate)}</span>
                <span className="font-medium text-foreground">{formatCurrency(payment.amount)}</span>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
