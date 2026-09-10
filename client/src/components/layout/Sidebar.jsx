import { HeartHandshake } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import SidebarItem from '@/components/layout/SidebarItem'
import { menuSections } from '@/constants/menuItems'
import { usePendingChangeRequestsCount } from '@/hooks/useProfileChangeRequests'
import { usePendingNewProfilesCount } from '@/hooks/useNewProfileApprovals'

function SidebarBrand() {
  return (
    <div className="flex h-[72px] shrink-0 items-center gap-2.5 border-b border-border px-6">
      <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
        <HeartHandshake className="size-5 text-primary" aria-hidden="true" />
      </div>
      <span className="font-heading text-lg font-semibold tracking-wide text-foreground">
        Kongu Admin
      </span>
    </div>
  )
}

function SidebarNav({ onNavigate }) {
  const { count: pendingChangeRequests } = usePendingChangeRequestsCount()
  const { count: pendingNewProfiles } = usePendingNewProfilesCount()
  const badges = { pendingChangeRequests, pendingNewProfiles }

  return (
    <nav className="flex-1 overflow-y-auto px-4 py-6" aria-label="Main navigation">
      {menuSections.map((section) => (
        <div key={section.section} className="mb-6 last:mb-0">
          <h3 className="mb-2 px-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            {section.section}
          </h3>
          <ul className="space-y-1">
            {section.items.map((item) => (
              <li key={item.path}>
                <SidebarItem
                  item={item}
                  onNavigate={onNavigate}
                  badge={item.badgeKey ? badges[item.badgeKey] : undefined}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

export default function Sidebar({ open, onOpenChange }) {
  return (
    <>
      {/* Desktop — fixed, always visible */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-border bg-white lg:flex">
        <SidebarBrand />
        <SidebarNav />
      </aside>

      {/* Tablet & mobile — off-canvas drawer, closes on outside click / navigation */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-[260px] gap-0 p-0 lg:hidden">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation menu</SheetTitle>
          </SheetHeader>
          <div className="flex h-full flex-col">
            <SidebarBrand />
            <SidebarNav onNavigate={() => onOpenChange(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
