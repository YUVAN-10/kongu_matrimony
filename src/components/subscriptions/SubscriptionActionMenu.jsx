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
  const isActive = plan.status === 'active'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label={`Actions for ${plan.planName}`}>
          <MoreVertical className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={() => onView(plan.id)} className="cursor-pointer">
          <Eye className="size-4" aria-hidden="true" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(plan.id)} className="cursor-pointer">
          <Pencil className="size-4" aria-hidden="true" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {isActive ? (
          <DropdownMenuItem onClick={() => onDeactivate(plan)} className="cursor-pointer">
            <PowerOff className="size-4" aria-hidden="true" />
            Deactivate
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => onActivate(plan)} className="cursor-pointer">
            <Power className="size-4" aria-hidden="true" />
            Activate
          </DropdownMenuItem>
        )}

      </DropdownMenuContent>
    </DropdownMenu>
  )
}