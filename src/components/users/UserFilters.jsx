import { RotateCcw, FileEdit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active Profiles' },
  { value: 'ALL', label: 'All Profiles' },
  { value: 'DRAFT', label: 'Draft Profiles' },
  { value: 'BLOCKED', label: 'Blocked Profiles' },
]

export default function UserFilters({ filters, onChange, onReset }) {
  const isDraft = filters?.status === 'DRAFT'

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-sm">
      <div className="w-48 space-y-1.5">
        <Label className="text-xs text-muted-foreground">Profile Status</Label>
        <Select
          value={filters.status || 'ACTIVE'}
          onValueChange={(status) => onChange({ status })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Active Profiles" />
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

      <Button
        type="button"
        variant={isDraft ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChange({ status: isDraft ? 'ACTIVE' : 'DRAFT' })}
        className="h-9 gap-1.5"
      >
        <FileEdit className="size-3.5" aria-hidden="true" />
        Draft Profiles
      </Button>

      <Button type="button" variant="outline" size="sm" onClick={onReset} className="h-9 gap-1.5">
        <RotateCcw className="size-3.5" aria-hidden="true" />
        Reset Filter
      </Button>
    </div>
  )
}

