import { useEffect, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

// Same debounced-search pattern as users/SearchBar.jsx — see that file's
// comment for why refs are used instead of value/onChange in the deps array.
export default function ProfileSearch({ value, onChange, className }) {
  const [localValue, setLocalValue] = useState(value)
  const onChangeRef = useRef(onChange)
  const valueRef = useRef(value)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    valueRef.current = value
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (localValue !== valueRef.current) onChangeRef.current(localValue)
    }, 300)
    return () => clearTimeout(timeout)
  }, [localValue])

  return (
    <div className={className}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={localValue}
          onChange={(event) => setLocalValue(event.target.value)}
          placeholder="Search by name, phone, email, or profile ID…"
          className="pl-9"
          aria-label="Search profiles"
        />
      </div>
    </div>
  )
}
