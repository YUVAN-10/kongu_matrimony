import { Link } from 'react-router-dom'
import SubscriptionStatusBadge from '@/components/userSubscriptions/SubscriptionStatusBadge'
import { formatCurrency, formatDate, getEffectiveSubscriptionStatus } from '@/utils/helpers'

// All subscription documents ever created for this user (excluding the one
// currently being viewed) — distinct from SubscriptionTimeline, which shows
// the event log *within* a single subscription document.
export default function SubscriptionHistory({ history = [] }) {
  if (history.length === 0) {
    return <p className="text-sm text-muted-foreground">No previous subscriptions for this user.</p>
  }

  return (
    <ul className="divide-y divide-border/60">
      {history.map((sub) => (
        <li key={sub.id} className="flex items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            <Link
              to={`/user-subscriptions/${sub.id}`}
              className="truncate text-sm font-medium text-foreground hover:text-primary"
            >
              {sub.planName}
            </Link>
            <p className="text-xs text-muted-foreground">
              {formatDate(sub.purchaseDate)} → {formatDate(sub.expiryDate)} ·{' '}
              {formatCurrency(sub.amount)}
            </p>
          </div>
          <SubscriptionStatusBadge status={getEffectiveSubscriptionStatus(sub)} />
        </li>
      ))}
    </ul>
  )
}
