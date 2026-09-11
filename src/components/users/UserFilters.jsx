import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'BLOCKED', label: 'Blocked' },
]

export default function UserFilters({ filters, onChange, onReset }) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-sm">
      <div className="w-44 space-y-1.5">
        <Label className="text-xs text-muted-foreground">User Status</Label>
        <Select
          value={filters.status || 'ALL'}
          onValueChange={(status) => onChange({ status })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="button" variant="outline" size="sm" onClick={onReset} className="h-9 gap-1.5">
        <RotateCcw className="size-3.5" aria-hidden="true" />
        Reset Filter
      </Button>
    </div>
  )
}
