import {
  LayoutDashboard,
  Users,
  NotebookText,
  Gem,
  FileStack,
  CreditCard,
  ScrollText,
} from 'lucide-react'

// Single source of truth for sidebar navigation.
// Add a new module by appending an item here — Sidebar, Navbar (page title)
// and Breadcrumb all read from this config, nothing else needs to change.
export const menuSections = [
  {
    section: 'Main',
    items: [{ title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' }],
  },
  {
    section: 'User Management',
    items: [
      { title: 'Users', icon: Users, path: '/users' },
      { title: 'Profiles', icon: NotebookText, path: '/profiles' },
      { title: 'Draft Profiles', icon: NotebookText, path: '/profiles/drafts' },
    ],
  },
  {
    section: 'Subscription',
    items: [
      { title: 'Subscription Plans', icon: Gem, path: '/subscription-plans' },
      { title: 'User Subscriptions', icon: FileStack, path: '/user-subscriptions' },
      { title: 'Payments', icon: CreditCard, path: '/payments' },
    ],
  },
  {
    section: 'System',
    items: [
      { title: 'Activity Logs', icon: ScrollText, path: '/activity-logs' },
    ],
  },
]

export const flatMenuItems = menuSections.flatMap((section) => section.items)

export function getPageTitle(pathname) {
  const match = flatMenuItems.find((item) => item.path === pathname)
  return match?.title ?? 'Admin Panel'
}