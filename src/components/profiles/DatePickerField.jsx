import { useState, useRef, useEffect } from 'react'
import { Controller } from 'react-hook-form'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, X } from 'lucide-react'
import { Label } from '@/components/ui/label'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function parseDateDDMMYYYY(val) {
  if (!val || typeof val !== 'string') return null
  const trimmed = val.trim()
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    const [d, m, y] = trimmed.split('/').map(Number)
    const dt = new Date(y, m - 1, d)
    if (!isNaN(dt.getTime())) return dt
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split('-').map(Number)
    const dt = new Date(y, m - 1, d)
    if (!isNaN(dt.getTime())) return dt
  }
  const dt = new Date(val)
  return isNaN(dt.getTime()) ? null : dt
}

function formatDateDDMMYYYY(date) {
  if (!date || isNaN(date.getTime())) return ''
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

function fieldError(errors, name) {
  return name.split('.').reduce((acc, key) => acc?.[key], errors)
}

export default function DatePickerField({
  name,
  label = 'Date of Birth',
  control,
  errors,
  required = false,
  rules = {},
  className = '',
  minYear = 1950,
  maxYear = new Date().getFullYear(),
}) {
  const error = fieldError(errors, name)
  const containerRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)

  // Close calendar on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`relative space-y-1.5 ${className}`} ref={containerRef}>
      <Label htmlFor={name} className="font-semibold text-sm text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>

      <Controller
        name={name}
        control={control}
        rules={{
          ...(required ? { required: 'Please select your Date of Birth.' } : {}),
          ...rules,
        }}
        render={({ field }) => {
          const selectedDate = parseDateDDMMYYYY(field.value)
          const displayValue = selectedDate ? formatDateDDMMYYYY(selectedDate) : (field.value || '')

          return (
            <div className="relative">
              {/* Premium Input Trigger Button */}
              <button
                id={name}
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className={`flex h-[56px] w-full items-center justify-between rounded-[16px] border px-4 py-3 text-left transition-all duration-200 outline-none ${
                  error
                    ? 'border-destructive bg-destructive/5 ring-1 ring-destructive'
                    : isOpen
                    ? 'border-[#C9A227] bg-[#FAF8F5] ring-2 ring-[#C9A227]/20 shadow-sm'
                    : 'border-[#E5E7EB] bg-[#FAF8F5] hover:bg-[#F4EFEC] hover:border-amber-300'
                }`}
                aria-expanded={isOpen}
                aria-invalid={Boolean(error)}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <CalendarIcon className="size-5 shrink-0 text-[#C9A227]" />
                  <span
                    className={`text-sm truncate font-medium ${
                      displayValue ? 'text-gray-900 font-semibold' : 'text-gray-400 font-normal'
                    }`}
                  >
                    {displayValue || 'Select your Date of Birth'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {displayValue && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation()
                        field.onChange('')
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200/50"
                      title="Clear date"
                    >
                      <X className="size-4" />
                    </span>
                  )}
                  <ChevronDown className={`size-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#C9A227]' : ''}`} />
                </div>
              </button>

              {/* Error Message */}
              {error && <p className="text-xs font-medium text-destructive mt-1">{error.message}</p>}

              {/* Popup Calendar Dropdown */}
              {isOpen && (
                <CalendarPopup
                  selectedDate={selectedDate}
                  minYear={minYear}
                  maxYear={maxYear}
                  onSelectDate={(date) => {
                    const formatted = formatDateDDMMYYYY(date)
                    field.onChange(formatted)
                    setIsOpen(false)
                  }}
                  onClose={() => setIsOpen(false)}
                />
              )}
            </div>
          )
        }}
      />
    </div>
  )
}

function CalendarPopup({ selectedDate, minYear, maxYear, onSelectDate, onClose }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Default view year/month
  const initialYear = selectedDate ? selectedDate.getFullYear() : (today.getFullYear() - 25)
  const initialMonth = selectedDate ? selectedDate.getMonth() : 0

  const [viewYear, setViewYear] = useState(initialYear)
  const [viewMonth, setViewMonth] = useState(initialMonth)

  const yearOptions = []
  for (let y = maxYear; y >= minYear; y--) {
    yearOptions.push(y)
  }

  function handlePrevMonth() {
    if (viewMonth === 0) {
      if (viewYear > minYear) {
        setViewYear(viewYear - 1)
        setViewMonth(11)
      }
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  function handleNextMonth() {
    if (viewMonth === 11) {
      if (viewYear < maxYear) {
        setViewYear(viewYear + 1)
        setViewMonth(0)
      }
    } else {
      // Check if next month exceeds current date in maxYear
      const nextMonthDate = new Date(viewYear, viewMonth + 1, 1)
      if (nextMonthDate <= today) {
        setViewMonth(viewMonth + 1)
      }
    }
  }

  // Days calculation
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const daysArray = []
  // Empty slots for preceding days
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null)
  }
  // Days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d)
  }

  return (
    <div
      className="absolute left-0 top-[64px] z-50 w-[320px] max-w-[90vw] rounded-[20px] bg-white p-4 shadow-2xl border border-amber-200/60 ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95 duration-150"
      style={{
        boxShadow: '0 12px 36px -4px rgba(0, 0, 0, 0.16), 0 4px 16px -2px rgba(201, 162, 39, 0.12)',
      }}
    >
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-amber-100">
        <div className="flex items-center gap-1.5">
          {/* Month Selector */}
          <select
            value={viewMonth}
            onChange={(e) => setViewMonth(Number(e.target.value))}
            className="text-sm font-semibold text-gray-800 bg-amber-50/60 hover:bg-amber-100/60 rounded-lg px-2 py-1 border border-amber-200/50 outline-none cursor-pointer transition-colors"
          >
            {MONTH_NAMES.map((m, idx) => (
              <option key={m} value={idx}>
                {m}
              </option>
            ))}
          </select>

          {/* Year Selector */}
          <select
            value={viewYear}
            onChange={(e) => setViewYear(Number(e.target.value))}
            className="text-sm font-semibold text-gray-800 bg-amber-50/60 hover:bg-amber-100/60 rounded-lg px-2 py-1 border border-amber-200/50 outline-none cursor-pointer transition-colors"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Prev / Next Buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={viewYear <= minYear && viewMonth === 0}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-amber-100/70 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Previous Month"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            disabled={viewYear >= maxYear && viewMonth >= today.getMonth()}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-amber-100/70 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Next Month"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Weekdays Header */}
      <div className="grid grid-cols-7 mb-1 text-center">
        {WEEKDAYS.map((wd) => (
          <span key={wd} className="text-xs font-semibold text-gray-400 py-1">
            {wd}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {daysArray.map((dayNum, index) => {
          if (dayNum === null) {
            return <div key={`empty-${index}`} className="h-8" />
          }

          const cellDate = new Date(viewYear, viewMonth, dayNum)
          cellDate.setHours(0, 0, 0, 0)

          const isFuture = cellDate > today
          const isBeforeMin = viewYear < minYear

          const isSelected =
            selectedDate &&
            selectedDate.getFullYear() === viewYear &&
            selectedDate.getMonth() === viewMonth &&
            selectedDate.getDate() === dayNum

          const isTodayDate =
            today.getFullYear() === viewYear &&
            today.getMonth() === viewMonth &&
            today.getDate() === dayNum

          const isDisabled = isFuture || isBeforeMin

          return (
            <button
              key={dayNum}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelectDate(cellDate)}
              className={`h-8 w-8 mx-auto flex items-center justify-center text-xs rounded-full font-medium transition-all ${
                isSelected
                  ? 'bg-[#C9A227] text-white font-bold shadow-md scale-105'
                  : isTodayDate
                  ? 'border-2 border-[#E67E22] text-[#E67E22] font-semibold hover:bg-[#FFF8E7]'
                  : isDisabled
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-[#FFF8E7] hover:text-[#C9A227] hover:font-semibold'
              }`}
            >
              {dayNum}
            </button>
          )
        })}
      </div>

      {/* Footer info / Quick Actions */}
      <div className="mt-3 pt-2 border-t border-amber-100 flex items-center justify-between text-[11px] text-gray-500">
        <span>Format: DD/MM/YYYY</span>
        <button
          type="button"
          onClick={() => {
            setViewYear(today.getFullYear())
            setViewMonth(today.getMonth())
          }}
          className="text-[#C9A227] font-semibold hover:underline"
        >
          Go to Today
        </button>
      </div>
    </div>
  )
}
