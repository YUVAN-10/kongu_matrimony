import { Eye, MoreVertical, Pencil, PowerOff, Power } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function SubscriptionActionMenu({ plan, onView, onEdit, onActivate, onDeactivate }) {
  const isPlanActive = plan.isActive !== false
  const planCode = plan.code || plan.id

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Actions for ${plan.name || plan.planName || planCode}`}
        >
          <MoreVertical className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={() => onView(planCode)} className="cursor-pointer">
          <Eye className="size-4" aria-hidden="true" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(planCode)} className="cursor-pointer">
          <Pencil className="size-4" aria-hidden="true" />
          Edit Plan
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {isPlanActive ? (
          <DropdownMenuItem onClick={() => onDeactivate(plan)} className="cursor-pointer text-destructive">
            <PowerOff className="size-4" aria-hidden="true" />
            Deactivate
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => onActivate(plan)} className="cursor-pointer text-success">
            <Power className="size-4" aria-hidden="true" />
            Activate
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}