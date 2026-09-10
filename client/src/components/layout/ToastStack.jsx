import { Link } from 'react-router-dom'
import { UserCheck, Wallet, X } from 'lucide-react'
import { useNotifications } from '@/context/NotificationContext'
import { cn } from '@/lib/utils'

const TYPE_ICON = {
  new_profile: UserCheck,
  new_payment: Wallet,
}

/**
 * Transient popups for realtime awareness while an admin is actively using
 * the panel — the persistent list lives in NotificationBell's dropdown.
 * Both read from the same NotificationProvider so a new arrival shows up in
 * both places from a single Firestore event, not two.
 */
export default function ToastStack() {
  const { toasts, dismissToast, markRead } = useNotifications()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-20 right-4 z-50 flex w-80 flex-col gap-2 sm:right-6">
      {toasts.map((toast) => {
        const Icon = TYPE_ICON[toast.type] || UserCheck
        return (
          <div
            key={toast.id}
            role="status"
            className="animate-in slide-in-from-top-2 fade-in flex items-start gap-3 rounded-lg border border-border/70 bg-white p-3 shadow-lg duration-300"
          >
            <span
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-full',
                toast.type === 'new_payment' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <Link
              to={toast.link}
              onClick={() => {
                markRead(toast.id)
                dismissToast(toast.id)
              }}
              className="min-w-0 flex-1"
            >
              <p className="text-sm font-medium text-foreground">{toast.title}</p>
              <p className="text-xs text-muted-foreground">{toast.description}</p>
            </Link>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Dismiss notification"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
