import { useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Breadcrumb from '@/components/layout/Breadcrumb'
import UserProfileDropdown from '@/components/layout/UserProfileDropdown'
import NotificationBell from '@/components/layout/NotificationBell'
import { getPageTitle } from '@/constants/menuItems'

export default function Navbar({ onMenuClick }) {
  const location = useLocation()
  const pageTitle = getPageTitle(location.pathname)

  return (
    <header className="fixed inset-x-0 top-0 z-30 flex h-[72px] items-center justify-between border-b border-border bg-white px-4 sm:px-6 lg:left-[260px]">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 hover:bg-primary/5 lg:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu className="size-5" aria-hidden="true" />
        </Button>

        <div className="min-w-0">
          <h1 className="truncate font-heading text-lg font-semibold text-foreground">
            {pageTitle}
          </h1>
          <Breadcrumb pageTitle={pageTitle} />
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <NotificationBell />
        <UserProfileDropdown />
      </div>
    </header>
  )
}
