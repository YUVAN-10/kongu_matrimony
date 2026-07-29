import { RotateCcw, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PLAN_STATUS_OPTIONS } from '@/constants/subscriptionOptions'

// Search here is a plain controlled input (no debounce) — filtering happens
// entirely client-side over an already-loaded, small plan list, so there's
// no Firestore query cost per keystroke to protect against.
export default function SubscriptionFilters({ searchTerm, onSearchChange, statusFilter, onStatusChange, onReset }) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border/70 bg-white p-4">
      <div className="w-full space-y-1.5 sm:w-64">
        <Label htmlFor="plan-search" className="text-xs text-muted-foreground">
          Search
        </Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="plan-search"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by plan name…"
            className="pl-9"
          />
        </div>
      </div>

      <div className="w-40 space-y-1.5">
        <Label className="text-xs text-muted-foreground">Status</Label>
        <Select value={statusFilter || 'all'} onValueChange={(value) => onStatusChange(value === 'all' ? '' : value)}>
          <SelectTrigger>
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {PLAN_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="button" variant="outline" onClick={onReset} className="gap-1.5">
        <RotateCcw className="size-3.5" aria-hidden="true" />
        Reset Filters
      </Button>
    </div>
  )
}
