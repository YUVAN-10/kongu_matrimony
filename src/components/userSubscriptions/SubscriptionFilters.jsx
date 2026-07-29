import { RotateCcw, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useFirestoreCollection } from '@/hooks/useFirestoreCollection'
import { SUBSCRIPTION_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS } from '@/constants/userSubscriptionOptions'

function FilterSelect({ label, value, options, onChange, width = 'w-40' }) {
  return (
    <div className={`${width} space-y-1.5`}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value || 'all'} onValueChange={(next) => onChange(next === 'all' ? '' : next)}>
        <SelectTrigger>
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default function SubscriptionFilters({ searchTerm, onSearchChange, filters, onChange, onReset }) {
  // Plan filter options come straight from Subscription Plans — that
  // collection is small and already realtime-loaded elsewhere, so a plain
  // fetch here is cheap and keeps this component self-contained.
  const { data: plans } = useFirestoreCollection('subscriptionPlans')
  const planOptions = plans.map((plan) => ({ value: plan.id, label: plan.planName }))

  return (
    <div className="space-y-3 rounded-xl border border-border/70 bg-white p-4">
      <div className="w-full space-y-1.5 sm:w-80">
        <Label htmlFor="subscription-search" className="text-xs text-muted-foreground">
          Search
        </Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="subscription-search"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by user name, phone, email, or profile ID…"
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <FilterSelect
          label="Subscription Status"
          value={filters.status}
          options={SUBSCRIPTION_STATUS_OPTIONS}
          onChange={(status) => onChange({ status })}
        />
        <FilterSelect
          label="Payment Status"
          value={filters.paymentStatus}
          options={PAYMENT_STATUS_OPTIONS}
          onChange={(paymentStatus) => onChange({ paymentStatus })}
        />
        <FilterSelect
          label="Plan"
          value={filters.planId}
          options={planOptions}
          onChange={(planId) => onChange({ planId })}
          width="w-48"
        />

        <div className="w-36 space-y-1.5">
          <Label className="text-xs text-muted-foreground">Purchased From</Label>
          <Input
            type="date"
            value={filters.purchaseDateFrom}
            onChange={(event) => onChange({ purchaseDateFrom: event.target.value })}
          />
        </div>
        <div className="w-36 space-y-1.5">
          <Label className="text-xs text-muted-foreground">Purchased To</Label>
          <Input
            type="date"
            value={filters.purchaseDateTo}
            onChange={(event) => onChange({ purchaseDateTo: event.target.value })}
          />
        </div>
        <div className="w-36 space-y-1.5">
          <Label className="text-xs text-muted-foreground">Expires From</Label>
          <Input
            type="date"
            value={filters.expiryDateFrom}
            onChange={(event) => onChange({ expiryDateFrom: event.target.value })}
          />
        </div>
        <div className="w-36 space-y-1.5">
          <Label className="text-xs text-muted-foreground">Expires To</Label>
          <Input
            type="date"
            value={filters.expiryDateTo}
            onChange={(event) => onChange({ expiryDateTo: event.target.value })}
          />
        </div>

        <Button type="button" variant="outline" onClick={onReset} className="gap-1.5">
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Reset Filters
        </Button>
      </div>
    </div>
  )
}
