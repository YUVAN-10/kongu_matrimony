import {
  LayoutDashboard,
  Users,
  Gem,
  FileStack,
  CreditCard,
  ClipboardCheck,
  UserCheck,
  Shield,
  UserMinus,
} from 'lucide-react'

// Single source of truth for sidebar navigation.
export const menuSections = [
  {
    section: 'Main',
    items: [{ title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' }],
  },
  {
    section: 'User Management',
    items: [
      { title: 'Users', icon: Users, path: '/users' },
      {
        title: 'New Profile Approvals',
        icon: UserCheck,
        path: '/profiles/new-approvals',
        badgeKey: 'pendingNewProfiles',
      },
      {
        title: 'Profile Change Approvals',
        icon: ClipboardCheck,
        path: '/profiles/change-approvals',
        badgeKey: 'pendingChangeRequests',
      },
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
    section: 'Legal & Info',
    items: [
      { title: 'Privacy Policy', icon: Shield, path: '/privacy-policy' },
      { title: 'Delete Account Form', icon: UserMinus, path: '/delete-account' },
    ],
  },
]

export const flatMenuItems = menuSections.flatMap((section) => section.items)

export function getPageTitle(pathname) {
  const match = flatMenuItems.find((item) => item.path === pathname)
  return match?.title ?? 'Admin Panel'
}