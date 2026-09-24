import { Link } from 'react-router-dom'
import { UserCheck, Wallet, X, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useNotifications } from '@/context/NotificationContext'
import { cn } from '@/lib/utils'

const TYPE_ICON = {
  new_profile: UserCheck,
  new_payment: Wallet,
  warning: AlertTriangle,
  error: AlertCircle,
  success: CheckCircle2,
}

export default function ToastStack() {
  const { toasts, dismissToast, markRead } = useNotifications()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-20 right-4 z-50 flex w-80 flex-col gap-2 sm:right-6">
      {toasts.map((toast) => {
        const Icon = TYPE_ICON[toast.type] || UserCheck
        const isWarning = toast.type === 'warning'
        const isError = toast.type === 'error'
        const isPayment = toast.type === 'new_payment'

        const iconBg = isWarning
          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
          : isError
            ? 'bg-destructive/15 text-destructive'
            : isPayment
              ? 'bg-success/10 text-success'
              : 'bg-primary/10 text-primary'

        const content = (
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">{toast.title}</p>
            <p className="text-xs text-muted-foreground">{toast.description}</p>
          </div>
        )

        return (
          <div
            key={toast.id}
            role="status"
            className="animate-in slide-in-from-top-2 fade-in flex items-start gap-3 rounded-lg border border-border/70 bg-white p-3 shadow-lg duration-300 dark:bg-card"
          >
            <span
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-full',
                iconBg
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
            </span>

            {toast.link ? (
              <Link
                to={toast.link}
                onClick={() => {
                  markRead(toast.id)
                  dismissToast(toast.id)
                }}
                className="min-w-0 flex-1"
              >
                {content}
              </Link>
            ) : (
              content
            )}

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
