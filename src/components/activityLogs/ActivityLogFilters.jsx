import { RotateCcw, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ACTIVITY_MODULES, ACTIVITY_ACTIONS } from '@/constants/activityLogOptions'

function FilterSelect({ label, value, options, onChange, width = 'w-44' }) {
  return (
    <div className={`${width} space-y-1.5`}>
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

export default function ActivityLogFilters({ searchTerm, onSearchChange, filters, onChange, onReset, adminOptions }) {
  return (
    <div className="space-y-3 rounded-xl border border-border/70 bg-white p-4">
      <div className="w-full space-y-1.5 sm:w-80">
        <Label htmlFor="activity-log-search" className="text-xs text-muted-foreground">
          Search
        </Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="activity-log-search"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by admin name, target ID, or description…"
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <FilterSelect
          label="Module"
          value={filters.module}
          options={ACTIVITY_MODULES}
          onChange={(module) => onChange({ module })}
        />
        <FilterSelect
          label="Action"
          value={filters.action}
          options={ACTIVITY_ACTIONS}
          onChange={(action) => onChange({ action })}
        />
        <FilterSelect
          label="Admin"
          value={filters.adminId}
          options={adminOptions}
          onChange={(adminId) => onChange({ adminId })}
        />

        <div className="w-36 space-y-1.5">
          <Label className="text-xs text-muted-foreground">Date From</Label>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(event) => onChange({ dateFrom: event.target.value })}
          />
        </div>
        <div className="w-36 space-y-1.5">
          <Label className="text-xs text-muted-foreground">Date To</Label>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(event) => onChange({ dateTo: event.target.value })}
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
