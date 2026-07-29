import { CheckCircle2, Eye, MoreVertical, RotateCcw, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function PaymentActionMenu({ payment, onView, onMarkSuccess, onMarkFailed, onRetry, onCancel, onRefund }) {
  const status = payment.status

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label="Payment actions">
          <MoreVertical className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onView(payment.id)} className="cursor-pointer">
          <Eye className="size-4" aria-hidden="true" />
          View
        </DropdownMenuItem>

        {(status === 'pending' || status === 'failed') && (
          <>
            <DropdownMenuSeparator />
            {status === 'failed' && (
              <DropdownMenuItem onClick={() => onRetry(payment)} className="cursor-pointer">
                <RotateCcw className="size-4" aria-hidden="true" />
                Retry
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onMarkSuccess(payment)} className="cursor-pointer">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Mark Success
            </DropdownMenuItem>
            {status === 'pending' && (
              <DropdownMenuItem onClick={() => onMarkFailed(payment)} className="cursor-pointer">
                <XCircle className="size-4" aria-hidden="true" />
                Mark Failed
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => onCancel(payment)}
              className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <XCircle className="size-4" aria-hidden="true" />
              Cancel
            </DropdownMenuItem>
          </>
        )}

        {status === 'success' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onRefund(payment)}
              className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Refund
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
