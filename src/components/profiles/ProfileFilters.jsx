import { useEffect, useRef, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  GENDER_OPTIONS,
  RELIGION_OPTIONS,
  SUBSCRIPTION_OPTIONS,
  PROFILE_STATUS_OPTIONS,
} from '@/constants/profileOptions'

function FilterSelect({ label, value, options, onChange, width = 'w-36' }) {
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

function DebouncedTextFilter({ id, label, value, onCommit, placeholder, width = 'w-40' }) {
  const [local, setLocal] = useState(value)
  const onCommitRef = useRef(onCommit)
  const valueRef = useRef(value)

  useEffect(() => {
    onCommitRef.current = onCommit
  }, [onCommit])

  useEffect(() => {
    valueRef.current = value
    setLocal(value)
  }, [value])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (local !== valueRef.current) onCommitRef.current(local)
    }, 400)
    return () => clearTimeout(timeout)
  }, [local])

  return (
    <div className={`${width} space-y-1.5`}>
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Input id={id} value={local} onChange={(event) => setLocal(event.target.value)} placeholder={placeholder} />
    </div>
  )
}

const RELIGION_SELECT_OPTIONS = RELIGION_OPTIONS.map((r) => ({ value: r, label: r }))

export default function ProfileFilters({ filters, onChange, onReset }) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border/70 bg-white p-4">
      <FilterSelect
        label="Gender"
        value={filters.gender}
        options={GENDER_OPTIONS}
        onChange={(gender) => onChange({ gender })}
      />
      <FilterSelect
        label="Religion"
        value={filters.religion}
        options={RELIGION_SELECT_OPTIONS}
        onChange={(religion) => onChange({ religion })}
        width="w-40"
      />
      <DebouncedTextFilter
        id="city-filter"
        label="City"
        value={filters.city}
        onCommit={(city) => onChange({ city })}
        placeholder="e.g. Erode"
      />
      <DebouncedTextFilter
        id="occupation-filter"
        label="Occupation"
        value={filters.occupation}
        onCommit={(occupation) => onChange({ occupation })}
        placeholder="e.g. Engineer"
      />
      <FilterSelect
        label="Subscription"
        value={filters.subscription}
        options={SUBSCRIPTION_OPTIONS}
        onChange={(subscription) => onChange({ subscription })}
      />
      <DebouncedTextFilter
        id="created-by-filter"
        label="Created By"
        value={filters.createdBy}
        onCommit={(createdBy) => onChange({ createdBy })}
        placeholder="Admin name"
      />
      <FilterSelect
        label="Profile Status"
        value={filters.status}
        options={PROFILE_STATUS_OPTIONS}
        onChange={(status) => onChange({ status })}
        width="w-40"
      />

      <div className="w-36 space-y-1.5">
        <Label htmlFor="date-from-filter" className="text-xs text-muted-foreground">
          Registered From
        </Label>
        <Input
          id="date-from-filter"
          type="date"
          value={filters.dateFrom}
          onChange={(event) => onChange({ dateFrom: event.target.value })}
        />
      </div>

      <div className="w-36 space-y-1.5">
        <Label htmlFor="date-to-filter" className="text-xs text-muted-foreground">
          Registered To
        </Label>
        <Input
          id="date-to-filter"
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
  )
}
