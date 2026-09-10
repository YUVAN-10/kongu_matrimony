import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertTriangle, CircleAlert, CreditCard, RefreshCw, UserRound, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import SubscriptionStatusBadge from '@/components/userSubscriptions/SubscriptionStatusBadge'
import SubscriptionTimeline from '@/components/userSubscriptions/SubscriptionTimeline'
import SubscriptionHistory from '@/components/userSubscriptions/SubscriptionHistory'
import CancelDialog from '@/components/userSubscriptions/CancelDialog'
import { useAuth } from '@/hooks/useAuth'
import { getUserById } from '@/services/userService'
import { getProfileById } from '@/services/profileService'
import {
  getSubscriptionById,
  getSubscriptionHistoryForUser,
  cancelSubscription,
} from '@/services/userSubscriptionService'
import { formatCurrency, formatDate, getDaysRemaining, getEffectiveSubscriptionStatus } from '@/utils/helpers'

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium text-foreground">{value ?? '—'}</span>
    </div>
  )
}

export default function ViewSubscription() {
  const { subscriptionId } = useParams()
  const { currentAdmin } = useAuth()

  const [subscription, setSubscription] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [profileDeleted, setProfileDeleted] = useState(false)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cancelOpen, setCancelOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    getSubscriptionById(subscriptionId)
      .then(async (sub) => {
        if (cancelled) return
        if (!sub) {
          setError('Subscription not found.')
          return
        }
        setSubscription(sub)

        const [userData, profileData, historyData] = await Promise.all([
          sub.userId ? getUserById(sub.userId) : null,
          sub.profileId ? getProfileById(sub.profileId) : null,
          sub.userId ? getSubscriptionHistoryForUser(sub.userId, sub.id) : [],
        ])
        if (cancelled) return
        setUser(userData)
        setProfile(profileData)
        setProfileDeleted(sub.profileId ? !profileData || profileData.system?.status === 'deleted' : false)
        setHistory(historyData)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not load subscription.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [subscriptionId])

  async function handleCancelConfirm() {
    await cancelSubscription(subscriptionId, { admin: currentAdmin })
    setSubscription((prev) => ({ ...prev, status: 'cancelled' }))
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !subscription) {
    return (
      <div role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>{error || 'Subscription not found.'}</span>
      </div>
    )
  }

  const effectiveStatus = getEffectiveSubscriptionStatus(subscription)
  const days = getDaysRemaining(subscription.expiryDate)
  const canCancel = effectiveStatus === 'active' || effectiveStatus === 'pending'
  const canRenew = effectiveStatus !== 'cancelled'

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">{subscription.planName}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <SubscriptionStatusBadge status={effectiveStatus} />
            {effectiveStatus === 'expired' && days !== null && (
              <span className="flex items-center gap-1 text-xs text-destructive">
                <AlertTriangle className="size-3.5" aria-hidden="true" />
                Expired {Math.abs(days)} days ago
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {canRenew && (
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link to={`/user-subscriptions/${subscriptionId}/renew`}>
                <RefreshCw className="size-4" aria-hidden="true" />
                Renew / Extend
              </Link>
            </Button>
          )}
          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelOpen(true)}
              className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <XCircle className="size-4" aria-hidden="true" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      {profileDeleted && (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>Profile no longer exists.</span>
        </div>
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
            <Row label="Account Status" value={user?.status} />
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-foreground">Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            {profileDeleted ? (
              <p className="text-sm text-muted-foreground">Profile no longer exists.</p>
            ) : (
              <>
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center overflow-hidden rounded-full bg-muted">
                    {profile?.photos?.main?.url ? (
                      <img src={profile.photos.main.url} alt="" className="size-full object-cover" />
                    ) : (
                      <UserRound className="size-5 text-muted-foreground" aria-hidden="true" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{profile?.personal?.fullName || '—'}</p>
                    <p className="text-xs text-muted-foreground capitalize">{profile?.personal?.gender}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-foreground">Subscription Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Plan" value={subscription.planName} />
            <Row label="Amount" value={formatCurrency(subscription.amount)} />
            <Row label="Purchase Date" value={formatDate(subscription.purchaseDate)} />
            <Row label="Start Date" value={formatDate(subscription.startDate)} />
            <Row label="Expiry Date" value={formatDate(subscription.expiryDate)} />
            <Row label="Days Remaining" value={days === null ? '—' : days < 0 ? `${Math.abs(days)} days expired` : `${days} days`} />
            <Row label="Created By" value={subscription.createdBy} />
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-foreground">Payment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Payment Status" value={subscription.paymentStatus} />
            {!subscription.paymentId && <p className="text-sm text-muted-foreground">Not linked yet</p>}
            {subscription.paymentId && (
              <Button asChild variant="outline" size="sm" className="mt-3 gap-1.5">
                <Link to={`/payments/${subscription.paymentId}`}>
                  <CreditCard className="size-4" aria-hidden="true" />
                  View Payment
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-foreground">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <SubscriptionTimeline timeline={subscription.timeline} />
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-foreground">Subscription History</CardTitle>
          </CardHeader>
          <CardContent>
            <SubscriptionHistory history={history} />
          </CardContent>
        </Card>
      </div>

      <CancelDialog
        subscription={subscription}
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onConfirm={handleCancelConfirm}
      />
    </div>
  )
}
