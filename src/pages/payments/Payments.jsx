import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle2, CircleAlert, Download, FileSpreadsheet, Plus, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PaymentSummaryCards from '@/components/payments/PaymentSummaryCards'
import PaymentFilters from '@/components/payments/PaymentFilters'
import PaymentTable from '@/components/payments/PaymentTable'
import PaymentCard from '@/components/payments/PaymentCard'
import RefundDialog from '@/components/payments/RefundDialog'
import { usePayments } from '@/hooks/usePayments'
import { useAuth } from '@/hooks/useAuth'
import {
  markPaymentSuccess,
  markPaymentFailed,
  retryPayment,
  cancelPayment,
  refundPayment,
  exportPaymentsToCsv,
  exportPaymentsToExcel,
} from '@/services/paymentService'

export default function Payments() {
  const { currentAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const successMessage = location.state?.successMessage

  const {
    payments,
    totalCount,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filters,
    updateFilters,
    resetFilters,
    summary,
  } = usePayments()

  const [refundTarget, setRefundTarget] = useState(null)
  const [actionError, setActionError] = useState(null)

  function goToView(paymentId) {
    navigate(`/payments/${paymentId}`)
  }

  async function runAction(action, label) {
    setActionError(null)
    try {
      await action()
    } catch (err) {
      setActionError(err.message || `Could not ${label}. Please try again.`)
    }
  }

  async function handleRefundConfirm(reason) {
    await refundPayment(refundTarget.id, { refundReason: reason, admin: currentAdmin })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Payments</h1>
          <p className="text-sm text-muted-foreground">Track and manage subscription payments.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => exportPaymentsToCsv(payments)} disabled={payments.length === 0} className="gap-1.5">
            <Download className="size-4" aria-hidden="true" />
            CSV
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => exportPaymentsToExcel(payments)} disabled={payments.length === 0} className="gap-1.5">
            <FileSpreadsheet className="size-4" aria-hidden="true" />
            Excel
          </Button>
          <Button asChild className="gap-1.5">
            <Link to="/payments/add">
              <Plus className="size-4" aria-hidden="true" />
              Add Payment
            </Link>
          </Button>
        </div>
      </div>

      {successMessage && (
        <div role="status" className="flex items-start gap-2 rounded-lg border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{successMessage}</span>
        </div>
      )}

      {(error || actionError) && (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{actionError || "Couldn't load payments. Check your connection and try again."}</span>
        </div>
      )}

      <PaymentSummaryCards summary={summary} loading={loading} />

      {!loading && totalCount === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border/70 bg-white py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
            <Receipt className="size-7 text-primary" aria-hidden="true" />
          </div>
          <div>
            <p className="font-heading text-lg font-semibold text-foreground">No payments yet</p>
            <p className="mx-auto max-w-sm text-sm text-muted-foreground">
              Record a payment for a user subscription to get started.
            </p>
          </div>
          <Button asChild className="gap-1.5">
            <Link to="/payments/add">
              <Plus className="size-4" aria-hidden="true" />
              Add Payment
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <PaymentFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filters}
            onChange={updateFilters}
            onReset={resetFilters}
          />

          <PaymentTable
            payments={payments}
            loading={loading}
            onView={goToView}
            onMarkSuccess={(payment) => runAction(() => markPaymentSuccess(payment.id, { admin: currentAdmin }), 'mark this payment successful')}
            onMarkFailed={(payment) => runAction(() => markPaymentFailed(payment.id, { admin: currentAdmin }), 'mark this payment failed')}
            onRetry={(payment) => runAction(() => retryPayment(payment.id, { admin: currentAdmin }), 'retry this payment')}
            onCancel={(payment) => runAction(() => cancelPayment(payment.id, { admin: currentAdmin }), 'cancel this payment')}
            onRefund={setRefundTarget}
          />
          <PaymentCard
            payments={payments}
            loading={loading}
            onView={goToView}
            onMarkSuccess={(payment) => runAction(() => markPaymentSuccess(payment.id, { admin: currentAdmin }), 'mark this payment successful')}
            onMarkFailed={(payment) => runAction(() => markPaymentFailed(payment.id, { admin: currentAdmin }), 'mark this payment failed')}
            onRetry={(payment) => runAction(() => retryPayment(payment.id, { admin: currentAdmin }), 'retry this payment')}
            onCancel={(payment) => runAction(() => cancelPayment(payment.id, { admin: currentAdmin }), 'cancel this payment')}
            onRefund={setRefundTarget}
          />
        </>
      )}

      <RefundDialog
        payment={refundTarget}
        open={Boolean(refundTarget)}
        onOpenChange={(open) => !open && setRefundTarget(null)}
        onConfirm={handleRefundConfirm}
      />
    </div>
  )
}
