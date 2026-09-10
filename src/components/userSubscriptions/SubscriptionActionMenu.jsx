import { Eye, MoreVertical, RefreshCw, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function SubscriptionActionMenu({ subscription, onView, onRenew, onCancel }) {
  const status = subscription.effectiveStatus
  const canCancel = status === 'active' || status === 'pending'
  const canRenew = status !== 'cancelled'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label="Subscription actions">
          <MoreVertical className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onView(subscription.id)} className="cursor-pointer">
          <Eye className="size-4" aria-hidden="true" />
          View
        </DropdownMenuItem>
        {canRenew && (
          <DropdownMenuItem onClick={() => onRenew(subscription)} className="cursor-pointer">
            <RefreshCw className="size-4" aria-hidden="true" />
            Renew / Extend
          </DropdownMenuItem>
        )}
        {canCancel && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onCancel(subscription)}
              className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <XCircle className="size-4" aria-hidden="true" />
              Cancel
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
