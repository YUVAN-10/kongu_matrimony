import { useEffect, useRef, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
]
const SUBSCRIPTION_OPTIONS = [
  { value: 'free', label: 'Free' },
  { value: 'premium', label: 'Premium' },
]
const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'blocked', label: 'Blocked' },
]

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

export default function UserFilters({ filters, onChange, onReset }) {
  // City is a free-text filter that would otherwise fire a new Firestore
  // query on every keystroke — debounce it the same way SearchBar does.
  const [city, setCity] = useState(filters.city)
  const onChangeRef = useRef(onChange)
  const filtersCityRef = useRef(filters.city)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    filtersCityRef.current = filters.city
    setCity(filters.city)
  }, [filters.city])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (city !== filtersCityRef.current) onChangeRef.current({ city })
    }, 400)
    return () => clearTimeout(timeout)
  }, [city])

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border/70 bg-white p-4">
      <FilterSelect
        label="Gender"
        value={filters.gender}
        options={GENDER_OPTIONS}
        onChange={(gender) => onChange({ gender })}
      />
      <FilterSelect
        label="Subscription"
        value={filters.subscription}
        options={SUBSCRIPTION_OPTIONS}
        onChange={(subscription) => onChange({ subscription })}
        width="w-40"
      />
      <FilterSelect
        label="Status"
        value={filters.status}
        options={STATUS_OPTIONS}
        onChange={(status) => onChange({ status })}
      />

      <div className="w-40 space-y-1.5">
        <Label htmlFor="city-filter" className="text-xs text-muted-foreground">
          City
        </Label>
        <Input
          id="city-filter"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="e.g. Erode"
        />
      </div>

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
