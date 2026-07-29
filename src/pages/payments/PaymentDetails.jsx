import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, CircleAlert, RotateCcw, UserRound, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import PaymentStatusBadge from '@/components/payments/PaymentStatusBadge'
import PaymentMethodBadge from '@/components/payments/PaymentMethodBadge'
import PaymentTimeline from '@/components/payments/PaymentTimeline'
import RefundDialog from '@/components/payments/RefundDialog'
import { useAuth } from '@/hooks/useAuth'
import { getUserById } from '@/services/userService'
import { getProfileById } from '@/services/profileService'
import { getSubscriptionById } from '@/services/userSubscriptionService'
import {
  getPaymentById,
  markPaymentSuccess,
  markPaymentFailed,
  retryPayment,
  cancelPayment,
  refundPayment,
} from '@/services/paymentService'
import { formatCurrency, formatDate } from '@/utils/helpers'

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium text-foreground">{value ?? '—'}</span>
    </div>
  )
}

export default function PaymentDetails() {
  const { paymentId } = useParams()
  const { currentAdmin } = useAuth()

  const [payment, setPayment] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [refundOpen, setRefundOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    getPaymentById(paymentId)
      .then(async (data) => {
        if (cancelled) return
        if (!data) {
          setError('Payment not found.')
          return
        }
        setPayment(data)

        const [userData, profileData, subscriptionData] = await Promise.all([
          data.userId ? getUserById(data.userId) : null,
          data.profileId ? getProfileById(data.profileId) : null,
          data.subscriptionId ? getSubscriptionById(data.subscriptionId) : null,
        ])
        if (cancelled) return
        setUser(userData)
        setProfile(profileData)
        setSubscription(subscriptionData)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not load payment.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [paymentId])

  async function runAction(action) {
    setActionError(null)
    try {
      await action()
      const refreshed = await getPaymentById(paymentId)
      setPayment(refreshed)
    } catch (err) {
      setActionError(err.message || 'Could not complete this action. Please try again.')
    }
  }

  async function handleRefundConfirm(reason) {
    await refundPayment(paymentId, { refundReason: reason, admin: currentAdmin })
    const refreshed = await getPaymentById(paymentId)
    setPayment(refreshed)
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !payment) {
    return (
      <div role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>{error || 'Payment not found.'}</span>
      </div>
    )
  }

  const status = payment.status
  const canRetry = status === 'failed'
  const canMarkSuccess = status === 'pending' || status === 'failed'
  const canMarkFailed = status === 'pending'
  const canCancel = status === 'pending' || status === 'failed'
  const canRefund = status === 'success'

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            {payment.transactionId || payment.id}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <PaymentStatusBadge status={status} />
            <PaymentMethodBadge method={payment.paymentMethod} />
            <span className="text-xs text-muted-foreground">{formatCurrency(payment.amount)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {canRetry && (
            <Button variant="outline" size="sm" onClick={() => runAction(() => retryPayment(paymentId, { admin: currentAdmin }))} className="gap-1.5">
              <RotateCcw className="size-4" aria-hidden="true" />
              Retry
            </Button>
          )}
          {canMarkSuccess && (
            <Button variant="outline" size="sm" onClick={() => runAction(() => markPaymentSuccess(paymentId, { admin: currentAdmin }))} className="gap-1.5">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Mark Success
            </Button>
          )}
          {canMarkFailed && (
            <Button variant="outline" size="sm" onClick={() => runAction(() => markPaymentFailed(paymentId, { admin: currentAdmin }))} className="gap-1.5">
              <XCircle className="size-4" aria-hidden="true" />
              Mark Failed
            </Button>
          )}
          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => runAction(() => cancelPayment(paymentId, { admin: currentAdmin }))}
              className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <XCircle className="size-4" aria-hidden="true" />
              Cancel
            </Button>
          )}
          {canRefund && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRefundOpen(true)}
              className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Refund
            </Button>
          )}
        </div>
      </div>

      {actionError && (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{actionError}</span>
        </div>
      )}

      {canRefund && (
        <p className="text-xs text-muted-foreground">
          Need to backdate the refund date?{' '}
          <Link to={`/payments/${paymentId}/refund`} className="text-primary hover:underline">
            Use the full refund form
          </Link>
          .
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-foreground">User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Name" value={user?.name} />
            <Row label="Phone" value={user?.phone} />
            <Row label="Email" value={user?.email} />
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-foreground">Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            {!profile || profile.system?.status === 'deleted' ? (
              <p className="text-sm text-muted-foreground">Profile no longer exists.</p>
            ) : (
              <>
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center overflow-hidden rounded-full bg-muted">
                    {profile.photos?.main?.url ? (
                      <img src={profile.photos.main.url} alt="" className="size-full object-cover" />
                    ) : (
                      <UserRound className="size-5 text-muted-foreground" aria-hidden="true" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{profile.personal?.fullName || '—'}</p>
                    <p className="text-xs text-muted-foreground capitalize">{profile.personal?.gender}</p>
                  </div>
                </div>
                <Row label="Profile ID" value={payment.profileId} />
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-foreground">Subscription Information</CardTitle>
          </CardHeader>
          <CardContent>
            {subscription ? (
              <>
                <Row label="Plan" value={subscription.planName} />
                <Row label="Subscription Status" value={subscription.status} />
                <Row label="Expiry Date" value={formatDate(subscription.expiryDate)} />
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <Link to={`/user-subscriptions/${payment.subscriptionId}`}>View Subscription</Link>
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Subscription not found.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-foreground">Payment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Amount" value={formatCurrency(payment.amount)} />
            <Row label="Currency" value={payment.currency} />
            <Row label="Gateway" value={payment.gateway} />
            <Row label="Gateway Reference" value={payment.gatewayReference || 'Not linked yet'} />
            <Row label="Payment Date" value={formatDate(payment.paymentDate)} />
            <Row label="Created By" value={payment.createdBy} />
            <Row label="Remarks" value={payment.remarks} />
            {payment.status === 'refunded' && (
              <>
                <Row label="Refund Date" value={formatDate(payment.refundDate)} />
                <Row label="Refund Reason" value={payment.refundReason} />
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-foreground">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentTimeline timeline={payment.timeline} />
          </CardContent>
        </Card>
      </div>

      <RefundDialog
        payment={payment}
        open={refundOpen}
        onOpenChange={setRefundOpen}
        onConfirm={handleRefundConfirm}
      />
    </div>
  )
}
