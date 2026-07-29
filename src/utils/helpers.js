// Common utility/helper functions (formatting, validation, etc.)

/** Normalizes a Firestore Timestamp, Date, or date string into a JS Date. */
export function toDate(value) {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value?.toDate === 'function') return value.toDate()
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function isToday(value) {
  const date = toDate(value)
  return date ? isSameDay(date, new Date()) : false
}

export function isPast(value) {
  const date = toDate(value)
  return date ? date.getTime() < Date.now() : false
}

/** True if the date falls between now and `days` days from now. */
export function isWithinNextDays(value, days) {
  const date = toDate(value)
  if (!date) return false
  const now = new Date()
  const future = new Date()
  future.setDate(future.getDate() + days)
  return date >= now && date <= future
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)
}

export function formatDate(value) {
  const date = toDate(value)
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

/** "2 hours ago" style relative time, falling back to formatDate beyond a week. */
export function formatRelativeTime(value) {
  const date = toDate(value)
  if (!date) return '—'

  const diffMinutes = Math.round((Date.now() - date.getTime()) / 60000)
  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes === 1 ? '' : 's'} ago`

  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`

  const diffDays = Math.round(diffHours / 24)
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`

  return formatDate(value)
}

/** Rounded whole-number percentage; safe against a zero/undefined total. */
export function toPercent(part, total) {
  if (!total) return 0
  return Math.round((part / total) * 100)
}

/** Time-of-day greeting based on the given (or current) local time. */
export function getTimeGreeting(date = new Date()) {
  const hour = date.getHours()
  if (hour >= 5 && hour < 12) return 'Good Morning'
  if (hour >= 12 && hour < 17) return 'Good Afternoon'
  if (hour >= 17 && hour < 21) return 'Good Evening'
  return 'Good Night'
}

/** Returns a new Date set to 23:59:59.999 of the given day (inclusive range-end filters). */
export function endOfDay(date) {
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  return end
}

/**
 * Age in whole years from a date of birth. Deliberately not stored in
 * Firestore — it changes every birthday, so it's always computed fresh from
 * `personal.dob` wherever it's displayed instead of going stale in the DB.
 */
export function calculateAge(dob) {
  const birthDate = toDate(dob)
  if (!birthDate) return null

  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const hasHadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate())
  if (!hasHadBirthdayThisYear) age -= 1

  return age
}

/**
 * Whole days between now and `expiryDate` — positive means still remaining,
 * negative means already expired (by that many days). Returns null if
 * there's no valid date, so callers can distinguish "no data" from "0 days".
 */
export function getDaysRemaining(expiryDate) {
  const expiry = toDate(expiryDate)
  if (!expiry) return null
  const diffMs = expiry.setHours(23, 59, 59, 999) - Date.now()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * The subscription's real-world status, derived from its stored `status`
 * plus today's date — never trust a stale stored value alone, since nothing
 * in this app flips `status` to "expired" automatically on a schedule (no
 * backend cron/Cloud Function exists). "cancelled" is terminal and always
 * wins; otherwise an expiryDate in the past means "expired" regardless of
 * what's stored, and anything else falls back to the stored status.
 */
export function getEffectiveSubscriptionStatus(subscription) {
  if (!subscription) return 'unknown'
  if (subscription.status === 'cancelled') return 'cancelled'
  if (subscription.expiryDate && isPast(subscription.expiryDate)) return 'expired'
  return subscription.status || 'pending'
}
