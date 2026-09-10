import { Eye, EyeOff, MoreVertical, Pencil, RotateCcw, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function ProfileActionMenu({ profile, onView, onEdit, onPublish, onHide, onRestore }) {
  const status = profile.system?.status

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Actions for ${profile.personal?.fullName || 'profile'}`}
        >
          <MoreVertical className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onView(profile.id)} className="cursor-pointer">
          <Eye className="size-4" aria-hidden="true" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(profile.id)} className="cursor-pointer">
          <Pencil className="size-4" aria-hidden="true" />
          Edit
        </DropdownMenuItem>

        {status === 'draft' && (
          <DropdownMenuItem onClick={() => onPublish(profile)} className="cursor-pointer">
            <Send className="size-4" aria-hidden="true" />
            Publish
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {status === 'active' && (
          <DropdownMenuItem onClick={() => onHide(profile)} className="cursor-pointer">
            <EyeOff className="size-4" aria-hidden="true" />
            Hide
          </DropdownMenuItem>
        )}
        {(status === 'hidden' || status === 'deleted') && (
          <DropdownMenuItem onClick={() => onRestore(profile)} className="cursor-pointer">
            <RotateCcw className="size-4" aria-hidden="true" />
            Restore
          </DropdownMenuItem>
        )}


      </DropdownMenuContent>
    </DropdownMenu>
  )
}