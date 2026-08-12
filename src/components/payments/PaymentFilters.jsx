import { RotateCcw, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useFirestoreCollection } from '@/hooks/useFirestoreCollection'
import { PAYMENT_STATUS_OPTIONS, PAYMENT_METHOD_OPTIONS, GATEWAY_OPTIONS } from '@/constants/paymentOptions'

function FilterSelect({ label, value, options, onChange, width = 'sm:w-40' }) {
  return (
    <div className={`w-full ${width} space-y-1.5`}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value || 'all'} onValueChange={(next) => onChange(next === 'all' ? '' : next)}>
        <SelectTrigger>
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {options.map((option) => {
            const optValue = typeof option === 'string' ? option : option.value
            const optLabel = typeof option === 'string' ? option : option.label
            return (
              <SelectItem key={optValue} value={optValue}>
                {optLabel}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
}

export default function PaymentFilters({ searchTerm, onSearchChange, filters, onChange, onReset }) {
  const { data: plans } = useFirestoreCollection('subscriptionPlans')
  const planOptions = plans.map((plan) => ({ value: plan.id, label: plan.planName }))

  return (
    <div className="space-y-3 rounded-xl border border-border/70 bg-white p-4">
      <div className="w-full space-y-1.5 sm:w-80">
        <Label htmlFor="payment-search" className="text-xs text-muted-foreground">
          Search
        </Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="payment-search"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by transaction ID, user name, phone, email, or profile ID…"
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-end">
        <FilterSelect
          label="Payment Status"
          value={filters.status}
          options={PAYMENT_STATUS_OPTIONS}
          onChange={(status) => onChange({ status })}
        />
        <FilterSelect
          label="Payment Method"
          value={filters.paymentMethod}
          options={PAYMENT_METHOD_OPTIONS}
          onChange={(paymentMethod) => onChange({ paymentMethod })}
          width="sm:w-44"
        />
        <FilterSelect
          label="Gateway"
          value={filters.gateway}
          options={GATEWAY_OPTIONS}
          onChange={(gateway) => onChange({ gateway })}
        />
        <FilterSelect
          label="Plan"
          value={filters.planId}
          options={planOptions}
          onChange={(planId) => onChange({ planId })}
          width="sm:w-48"
        />

        <div className="w-full space-y-1.5 sm:w-36">
          <Label className="text-xs text-muted-foreground">Date From</Label>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(event) => onChange({ dateFrom: event.target.value })}
          />
        </div>
        <div className="w-full space-y-1.5 sm:w-36">
          <Label className="text-xs text-muted-foreground">Date To</Label>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(event) => onChange({ dateTo: event.target.value })}
          />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          className="col-span-2 gap-1.5 sm:col-span-1"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Reset Filters
        </Button>
      </div>
    </div>
  )
}
