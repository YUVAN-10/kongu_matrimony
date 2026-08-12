import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle2, CircleAlert, Gem, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SubscriptionFilters from '@/components/subscriptions/SubscriptionFilters'
import SubscriptionTable from '@/components/subscriptions/SubscriptionTable'
import SubscriptionCard from '@/components/subscriptions/SubscriptionCard'
import DeactivatePlanDialog from '@/components/subscriptions/DeactivatePlanDialog'
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans'
import { useAuth } from '@/hooks/useAuth'
import { activatePlan, deactivatePlan } from '@/services/subscriptionService'
import { DEFAULT_PREMIUM_PLAN } from '@/constants/subscriptionOptions'

export default function SubscriptionPlans() {
  const navigate = useNavigate()
  const { currentAdmin } = useAuth()
  const location = useLocation()
  const successMessage = location.state?.successMessage

  const {
    plans,
    totalPlanCount,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    activeUserCounts,
  } = useSubscriptionPlans()

  const [deactivateTarget, setDeactivateTarget] = useState(null)

  function goToView(planId) {
    navigate(`/subscription-plans/${planId}`)
  }
  function goToEdit(planId) {
    navigate(`/subscription-plans/${planId}/edit`)
  }
  async function handleActivate(plan) {
    await activatePlan(plan.id, { admin: currentAdmin })
  }
  async function handleDeactivateConfirm() {
    await deactivatePlan(deactivateTarget.id, { admin: currentAdmin })
  }


  function resetFilters() {
    setSearchTerm('')
    setStatusFilter('')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Subscription Plans
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage the membership plans admins can assign to users.
          </p>
        </div>
        <Button asChild className="gap-1.5">
          <Link to="/subscription-plans/add">
            <Plus className="size-4" aria-hidden="true" />
            Add Plan
          </Link>
        </Button>
      </div>

      {successMessage && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-lg border border-success/20 bg-success/10 px-4 py-3 text-sm text-success"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>Couldn&apos;t load subscription plans. Check your connection and try again.</span>
        </div>
      )}

      {!loading && totalPlanCount === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border/70 bg-white py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
            <Gem className="size-7 text-primary" aria-hidden="true" />
          </div>
          <div>
            <p className="font-heading text-lg font-semibold text-foreground">
              No subscription plans yet
            </p>
            <p className="mx-auto max-w-sm text-sm text-muted-foreground">
              Create your first plan, or start from a ready-made Premium plan.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              type="button"
              onClick={() => navigate('/subscription-plans/add', { state: { preset: DEFAULT_PREMIUM_PLAN } })}
              className="gap-1.5"
            >
              <Gem className="size-4" aria-hidden="true" />
              Create Premium Plan
            </Button>
            <Button asChild variant="outline">
              <Link to="/subscription-plans/add">Add Custom Plan</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <SubscriptionFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            onReset={resetFilters}
          />

          <SubscriptionTable
            plans={plans}
            loading={loading}
            activeUserCounts={activeUserCounts}
            onView={goToView}
            onEdit={goToEdit}
            onActivate={handleActivate}
            onDeactivate={setDeactivateTarget}
          />

          <SubscriptionCard
            plans={plans}
            loading={loading}
            activeUserCounts={activeUserCounts}
            onView={goToView}
            onEdit={goToEdit}
            onActivate={handleActivate}
            onDeactivate={setDeactivateTarget}
          />
        </>
      )}

      <DeactivatePlanDialog
        plan={deactivateTarget}
        open={Boolean(deactivateTarget)}
        onOpenChange={(open) => !open && setDeactivateTarget(null)}
        onConfirm={handleDeactivateConfirm}
      />


    </div>
  )
}