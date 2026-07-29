import { Ban, Eye, MoreVertical, Pencil, ShieldCheck, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function UserActionMenu({ user, onView, onEdit, onBlock, onUnblock, onDelete }) {
  const isBlocked = user.status === 'blocked'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Actions for ${user.name || 'user'}`}
        >
          <MoreVertical className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={() => onView(user.id)} className="cursor-pointer">
          <Eye className="size-4" aria-hidden="true" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(user.id)} className="cursor-pointer">
          <Pencil className="size-4" aria-hidden="true" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {isBlocked ? (
          <DropdownMenuItem onClick={() => onUnblock(user)} className="cursor-pointer">
            <ShieldCheck className="size-4" aria-hidden="true" />
            Unblock
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => onBlock(user)} className="cursor-pointer">
            <Ban className="size-4" aria-hidden="true" />
            Block
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => onDelete(user)}
          className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
