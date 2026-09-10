import { useAuth } from '@/hooks/useAuth'
import { getTimeGreeting } from '@/utils/helpers'

export default function DashboardHeader() {
  const { currentAdmin } = useAuth()
  const now = new Date()

  const greeting = getTimeGreeting(now)
  const displayName = currentAdmin?.name || currentAdmin?.email?.split('@')[0] || 'Admin'
  const today = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now)

  return (
    <div className="animate-in fade-in slide-in-from-top-2 mb-6 flex flex-col gap-1 duration-500 sm:mb-8">
      <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
        {greeting}, {displayName} <span aria-hidden="true">👋</span>
      </h1>
      <p className="text-sm text-muted-foreground">
        Welcome back to Kongu Matrimony Admin Panel.
      </p>
      <p className="text-xs text-muted-foreground">Today is {today}</p>
    </div>
  )
}
