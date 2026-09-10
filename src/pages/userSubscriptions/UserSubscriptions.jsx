import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CalendarClock, CheckCircle2, CircleAlert, Download, FileSpreadsheet, Gem, Plus, Wallet, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import StatCard from '@/components/dashboard/StatCard'
import SubscriptionFilters from '@/components/userSubscriptions/SubscriptionFilters'
import SubscriptionTable from '@/components/userSubscriptions/SubscriptionTable'
import SubscriptionCard from '@/components/userSubscriptions/SubscriptionCard'
import RenewDialog from '@/components/userSubscriptions/RenewDialog'
import CancelDialog from '@/components/userSubscriptions/CancelDialog'
import { useUserSubscriptions } from '@/hooks/useUserSubscriptions'
import { useAuth } from '@/hooks/useAuth'
import {
  renewSubscription,
  cancelSubscription,
  exportSubscriptionsToCsv,
  exportSubscriptionsToExcel,
} from '@/services/userSubscriptionService'
import { formatCurrency } from '@/utils/helpers'

export default function UserSubscriptions() {
  const { currentAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const successMessage = location.state?.successMessage

  const {
    subscriptions,
    totalCount,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filters,
    updateFilters,
    resetFilters,
    dashboardStats,
  } = useUserSubscriptions()

  const [renewTarget, setRenewTarget] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)

  function goToView(subscriptionId) {
    navigate(`/user-subscriptions/${subscriptionId}`)
  }

  async function handleRenewConfirm() {
    await renewSubscription(renewTarget.id, { planId: renewTarget.planId, admin: currentAdmin })
  }
  async function handleCancelConfirm() {
    await cancelSubscription(cancelTarget.id, { admin: currentAdmin })
  }

  const statCards = [
    { title: 'Total Active Subscriptions', value: dashboardStats.totalActive, icon: CheckCircle2, accent: 'success' },
    { title: 'Expired Subscriptions', value: dashboardStats.totalExpired, icon: XCircle, accent: 'destructive' },
    { title: 'Cancelled Subscriptions', value: dashboardStats.totalCancelled, icon: XCircle, accent: 'primary' },
    { title: 'Revenue', value: formatCurrency(dashboardStats.revenue), subtitle: 'from paid subscriptions', icon: Wallet, accent: 'secondary' },
    { title: 'Expiring Within 7 Days', value: dashboardStats.expiringWithin7Days, icon: CalendarClock, accent: 'secondary' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">User Subscriptions</h1>
          <p className="text-sm text-muted-foreground">Assign, renew, extend, and cancel user subscriptions.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => exportSubscriptionsToCsv(subscriptions)} disabled={subscriptions.length === 0} className="gap-1.5">
            <Download className="size-4" aria-hidden="true" />
            CSV
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => exportSubscriptionsToExcel(subscriptions)} disabled={subscriptions.length === 0} className="gap-1.5">
            <FileSpreadsheet className="size-4" aria-hidden="true" />
            Excel
          </Button>
          <Button asChild className="gap-1.5">
            <Link to="/user-subscriptions/assign">
              <Plus className="size-4" aria-hidden="true" />
              Assign Subscription
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

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>Couldn&apos;t load subscriptions. Check your connection and try again.</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} loading={loading} />
        ))}
      </div>

      {!loading && totalCount === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border/70 bg-white py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
            <Gem className="size-7 text-primary" aria-hidden="true" />
          </div>
          <div>
            <p className="font-heading text-lg font-semibold text-foreground">No subscriptions yet</p>
            <p className="mx-auto max-w-sm text-sm text-muted-foreground">
              Assign a subscription plan to a user to get started.
            </p>
          </div>
          <Button asChild className="gap-1.5">
            <Link to="/user-subscriptions/assign">
              <Plus className="size-4" aria-hidden="true" />
              Assign Subscription
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <SubscriptionFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filters}
            onChange={updateFilters}
            onReset={resetFilters}
          />

          <SubscriptionTable
            subscriptions={subscriptions}
            loading={loading}
            onView={goToView}
            onRenew={setRenewTarget}
            onCancel={setCancelTarget}
          />
          <SubscriptionCard
            subscriptions={subscriptions}
            loading={loading}
            onView={goToView}
            onRenew={setRenewTarget}
            onCancel={setCancelTarget}
          />
        </>
      )}

      <RenewDialog
        subscription={renewTarget}
        open={Boolean(renewTarget)}
        onOpenChange={(open) => !open && setRenewTarget(null)}
        onConfirm={handleRenewConfirm}
      />
      <CancelDialog
        subscription={cancelTarget}
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        onConfirm={handleCancelConfirm}
      />
    </div>
  )
}
