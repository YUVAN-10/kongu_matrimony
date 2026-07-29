import { useEffect, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

// Debounced so realtime search doesn't fire a new Firestore query on every
// keystroke — 300ms feels instant without hammering the listener. onChange
// and value are read via refs inside the timeout so the debounce always
// fires the latest callback without needing to reset on every parent render.
export default function SearchBar({ value, onChange, className }) {
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
          placeholder="Search by name, phone, email, or user ID…"
          className="pl-9"
          aria-label="Search users"
        />
      </div>
    </div>
  )
}
