import { Link } from 'react-router-dom'
import { Download, Gem, Settings, UserPlus, UserRoundPlus } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

// Each action links to the existing page where that workflow will live once
// its CRUD module is built — no new routes were added for this redesign.
const ACTIONS = [
  { label: 'Add Profile', icon: UserRoundPlus, to: '/profiles' },
  { label: 'Add User', icon: UserPlus, to: '/users' },
  { label: 'Create Subscription', icon: Gem, to: '/subscription-plans' },
  { label: 'Export Users', icon: Download, to: '/users' },
  { label: 'Settings', icon: Settings, to: '/settings' },
]

export default function QuickActions() {
  return (
    <Card className="animate-in fade-in border-border/70 shadow-sm duration-500">
      <CardHeader>
        <CardTitle className="font-heading text-lg text-foreground">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {ACTIONS.map(({ label, icon: Icon, to }) => (
          <Link
            key={label}
            to={to}
            className="group flex flex-col items-center gap-2 rounded-xl border border-border/70 bg-white px-3 py-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.03] hover:border-primary/40 hover:bg-primary/5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="size-5" aria-hidden="true" />
            </div>
            <span className="text-xs font-medium text-foreground">{label}</span>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
