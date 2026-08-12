import { Link } from 'react-router-dom'
import { Bell, UserCheck, Wallet } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/context/NotificationContext'
import { formatRelativeTime } from '@/utils/helpers'
import { cn } from '@/lib/utils'

const TYPE_ICON = {
  new_profile: UserCheck,
  new_payment: Wallet,
}

export default function NotificationBell() {
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications()

  return (
    <DropdownMenu onOpenChange={(open) => open && unreadCount > 0 && markAllRead()}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative hover:bg-primary/5"
          aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        >
          <Bell className="size-5" aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <p className="px-2 py-4 text-center text-sm text-muted-foreground">
            No new profiles or payments yet.
          </p>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => {
              const Icon = TYPE_ICON[notification.type] || Bell
              return (
                <DropdownMenuItem key={notification.id} asChild className="cursor-pointer items-start gap-2 py-2">
                  <Link to={notification.link} onClick={() => markRead(notification.id)}>
                    <span
                      className={cn(
                        'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full',
                        notification.type === 'new_payment' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                      )}
                    >
                      <Icon className="size-3.5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-medium text-foreground">{notification.title}</span>
                        {!notification.read && (
                          <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                        )}
                      </span>
                      <span className="block text-xs text-muted-foreground">{notification.description}</span>
                      <span className="block text-[11px] text-muted-foreground/80">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </span>
                  </Link>
                </DropdownMenuItem>
              )
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
