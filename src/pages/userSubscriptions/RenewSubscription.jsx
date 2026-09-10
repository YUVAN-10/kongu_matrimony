import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CircleAlert, Loader2, RefreshCw, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useFirestoreCollection } from '@/hooks/useFirestoreCollection'
import { useAuth } from '@/hooks/useAuth'
import { getSubscriptionById, renewSubscription, extendSubscription } from '@/services/userSubscriptionService'
import { EXTENSION_OPTIONS } from '@/constants/userSubscriptionOptions'
import { formatCurrency, formatDate, getEffectiveSubscriptionStatus } from '@/utils/helpers'

function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export default function RenewSubscription() {
  const { subscriptionId } = useParams()
  const navigate = useNavigate()
  const { currentAdmin } = useAuth()

  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [mode, setMode] = useState('renew')
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [selectedDays, setSelectedDays] = useState(EXTENSION_OPTIONS[0].value)

  const { data: plans } = useFirestoreCollection('subscriptionPlans')
  const activePlans = useMemo(() => plans.filter((plan) => plan.status === 'active'), [plans])
  const selectedPlan = activePlans.find((plan) => plan.id === selectedPlanId)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getSubscriptionById(subscriptionId)
      .then((data) => {
        if (cancelled) return
        if (!data) {
          setLoadError('Subscription not found.')
        } else if (getEffectiveSubscriptionStatus(data) === 'cancelled') {
          setLoadError('This subscription is cancelled and cannot be renewed.')
        } else {
          setSubscription(data)
          setSelectedPlanId(data.planId)
        }
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message || 'Could not load subscription.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [subscriptionId])

  async function handleSubmit() {
    setSubmitError(null)
    setSubmitting(true)
    try {
      if (mode === 'renew') {
        await renewSubscription(subscriptionId, { planId: selectedPlanId, admin: currentAdmin })
      } else {
        await extendSubscription(subscriptionId, { days: selectedDays, admin: currentAdmin })
      }
      navigate(`/user-subscriptions/${subscriptionId}`, {
        state: { successMessage: mode === 'renew' ? 'Subscription renewed successfully.' : 'Subscription extended successfully.' },
      })
    } catch (err) {
      setSubmitError(err.message || 'Could not complete this action. Please try again.')
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

  const currentExpiry = subscription.expiryDate?.toDate?.() || new Date()
  const extendBase = currentExpiry.getTime() > Date.now() ? currentExpiry : new Date()
  const newExpiryForRenew = selectedPlan ? addDays(new Date(), Number(selectedPlan.durationDays)) : null
  const newExpiryForExtend = addDays(extendBase, Number(selectedDays))

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Renew / Extend Subscription</h1>
        <p className="text-sm text-muted-foreground">{subscription.planName} — current expiry {formatDate(subscription.expiryDate)}</p>
      </div>

      {submitError && (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{submitError}</span>
        </div>
      )}

      <Card className="border-border/70 shadow-sm">
        <CardHeader className="gap-3">
          <CardTitle className="font-heading text-lg text-foreground">Choose an Action</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant={mode === 'renew' ? 'default' : 'outline'} size="sm" onClick={() => setMode('renew')} className="gap-1.5">
              <RefreshCw className="size-4" aria-hidden="true" />
              Renew
            </Button>
            <Button type="button" variant={mode === 'extend' ? 'default' : 'outline'} size="sm" onClick={() => setMode('extend')} className="gap-1.5">
              <TrendingUp className="size-4" aria-hidden="true" />
              Extend
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {mode === 'renew' ? (
            <>
              <div className="space-y-1.5 sm:w-64">
                <Label>Plan</Label>
                <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan…" />
                  </SelectTrigger>
                  <SelectContent>
                    {activePlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.planName} — {formatCurrency(plan.price)}
                        {plan.id === subscription.planId ? ' (current)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPlan && (
                <div className="grid grid-cols-1 gap-4 rounded-lg border border-border/70 bg-muted/30 p-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="font-medium text-foreground">{formatCurrency(selectedPlan.price)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="font-medium text-foreground">{selectedPlan.durationDays} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">New Expiry Date</p>
                    <p className="font-medium text-foreground">{formatDate(newExpiryForRenew)}</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="space-y-1.5 sm:w-64">
                <Label>Extend By</Label>
                <Select value={String(selectedDays)} onValueChange={(value) => setSelectedDays(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXTENSION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={String(option.value)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border border-border/70 bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">New Expiry Date</p>
                <p className="font-medium text-foreground">{formatDate(newExpiryForExtend)}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => navigate(`/user-subscriptions/${subscriptionId}`)}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || (mode === 'renew' && !selectedPlanId)}
          className="gap-1.5"
        >
          {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {mode === 'renew' ? 'Renew Subscription' : 'Extend Subscription'}
        </Button>
      </div>
    </div>
  )
}
