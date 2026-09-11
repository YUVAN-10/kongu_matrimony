import { Ban, Eye, MoreVertical, Pencil, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function UserActionMenu({ user, onView, onEdit, onBlock, onUnblock }) {
  const isBlocked = (user?.status || '').toUpperCase() === 'BLOCKED' || Boolean(user?.isBlocked)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Actions for ${user?.name || 'user'}`}
        >
          <MoreVertical className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={() => onView(user?.id)} className="cursor-pointer">
          <Eye className="mr-2 size-4" aria-hidden="true" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(user?.id)} className="cursor-pointer">
          <Pencil className="mr-2 size-4" aria-hidden="true" />
          Edit User
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {isBlocked ? (
          <DropdownMenuItem
            onClick={() => onUnblock(user)}
            className="cursor-pointer text-success focus:text-success"
          >
            <ShieldCheck className="mr-2 size-4" aria-hidden="true" />
            Unblock User
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => onBlock(user)}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <Ban className="mr-2 size-4" aria-hidden="true" />
            Block User
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}