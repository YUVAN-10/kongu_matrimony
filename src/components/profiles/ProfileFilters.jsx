import { useEffect, useRef, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GENDER_OPTIONS, SUBSCRIPTION_OPTIONS, PROFILE_STATUS_OPTIONS } from '@/constants/profileOptions'

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

export default function ProfileFilters({ filters, onChange, onReset }) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border/70 bg-white p-4">
      <FilterSelect
        label="Gender"
        value={filters.gender}
        options={GENDER_OPTIONS}
        onChange={(gender) => onChange({ gender })}
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
      <FilterSelect
        label="Profile Status"
        value={filters.status}
        options={PROFILE_STATUS_OPTIONS}
        onChange={(status) => onChange({ status })}
        width="w-40"
      />

      <Button type="button" variant="outline" onClick={onReset} className="gap-1.5">
        <RotateCcw className="size-3.5" aria-hidden="true" />
        Reset Filters
      </Button>
    </div>
  )
}
