import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CircleAlert, Gem, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import SubscriptionStatusBadge from '@/components/subscriptions/SubscriptionStatusBadge'
import SubscriptionFeatureList from '@/components/subscriptions/SubscriptionFeatureList'
import { getSubscriptionPlanById, getAssignedUserCount } from '@/services/subscriptionService'
import { formatCurrency, formatDate } from '@/utils/helpers'

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium text-foreground">{value ?? '—'}</span>
    </div>
  )
}

export default function ViewSubscriptionPlan() {
  const { planId } = useParams()

  const [plan, setPlan] = useState(null)
  const [activeUserCount, setActiveUserCount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([getSubscriptionPlanById(planId), getAssignedUserCount(planId)])
      .then(([planData, count]) => {
        if (cancelled) return
        if (!planData) setError('Plan not found.')
        else {
          setPlan(planData)
          setActiveUserCount(count)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not load plan.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [planId])

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !plan) {
    return (
      <div
        role="alert"
        className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
      >
        <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>{error || 'Plan not found.'}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
            <Gem className="size-6 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-semibold text-foreground">{plan.planName}</h1>
            <div className="mt-1 flex items-center gap-2">
              <SubscriptionStatusBadge status={plan.status} />
              <span className="text-xs text-muted-foreground">{activeUserCount ?? 0} active user(s)</span>
            </div>
          </div>
        </div>

        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <Link to={`/subscription-plans/${planId}/edit`}>
            <Pencil className="size-4" aria-hidden="true" />
            Edit
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-foreground">Plan Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Price" value={formatCurrency(plan.price)} />
            <Row label="Duration" value={`${plan.durationDays} days`} />
            <Row label="Description" value={plan.description || 'No description provided.'} />
            <Row label="Created By" value={plan.createdBy} />
            <Row label="Created Date" value={formatDate(plan.createdAt)} />
            <Row label="Last Updated" value={formatDate(plan.updatedAt)} />
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-foreground">Features</CardTitle>
          </CardHeader>
          <CardContent>
            <SubscriptionFeatureList features={plan.features} readOnly />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
