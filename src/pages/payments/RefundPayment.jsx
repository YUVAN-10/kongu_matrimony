import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CircleAlert, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { getPaymentById, refundPayment } from '@/services/paymentService'
import { formatCurrency, formatDate } from '@/utils/helpers'

// Full-page refund workflow — a backdatable refund date + a longer reason,
// distinct from RefundDialog.jsx's fast "refund it now" path.
export default function RefundPayment() {
  const { paymentId } = useParams()
  const navigate = useNavigate()
  const { currentAdmin } = useAuth()

  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [refundDate, setRefundDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [reason, setReason] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getPaymentById(paymentId)
      .then((data) => {
        if (cancelled) return
        if (!data) {
          setLoadError('Payment not found.')
        } else if (data.status !== 'success') {
          setLoadError(`Only a successful payment can be refunded (this payment is ${data.status}).`)
        } else {
          setPayment(data)
        }
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message || 'Could not load payment.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [paymentId])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!reason.trim()) {
      setSubmitError('A refund reason is required.')
      return
    }
    setSubmitError(null)
    setSubmitting(true)
    try {
      await refundPayment(paymentId, { refundReason: reason.trim(), refundDate, admin: currentAdmin })
      navigate(`/payments/${paymentId}`, { state: { successMessage: 'Payment refunded successfully.' } })
    } catch (err) {
      setSubmitError(err.message || 'Could not refund payment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>{loadError}</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Refund Payment</h1>
        <p className="text-sm text-muted-foreground">
          {payment.transactionId || payment.id} — {formatCurrency(payment.amount)} paid {formatDate(payment.paymentDate)}
        </p>
      </div>

      {submitError && (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-foreground">Refund Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5 sm:w-64">
              <Label htmlFor="refund-date">Refund Date</Label>
              <Input
                id="refund-date"
                type="date"
                value={refundDate}
                onChange={(event) => setRefundDate(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="refund-reason">Refund Reason *</Label>
              <Textarea
                id="refund-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={4}
                placeholder="Why is this payment being refunded?"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(`/payments/${paymentId}`)}>
            Cancel
          </Button>
          <Button type="submit" variant="destructive" disabled={submitting} className="gap-1.5">
            {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            Refund Payment
          </Button>
        </div>
      </form>
    </div>
  )
}
