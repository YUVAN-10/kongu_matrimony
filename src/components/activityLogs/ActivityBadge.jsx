import {
  Ban,
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  FilePlus2,
  KeyRound,
  LogIn,
  LogOut,
  Pencil,
  RotateCcw,
  Send,
  Settings2,
  ShieldCheck,
  Trash2,
  Undo2,
  UserCheck,
  UserX,
  Wallet,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ACTIVITY_ACTIONS } from '@/constants/activityLogOptions'

const ACTION_META = {
  login: { icon: LogIn, className: 'bg-muted text-muted-foreground' },
  logout: { icon: LogOut, className: 'bg-muted text-muted-foreground' },
  create: { icon: FilePlus2, className: 'bg-success/10 text-success' },
  update: { icon: Pencil, className: 'bg-secondary/20 text-secondary-foreground' },
  delete: { icon: Trash2, className: 'bg-destructive/10 text-destructive' },
  restore: { icon: Undo2, className: 'bg-primary/10 text-primary' },
  block: { icon: Ban, className: 'bg-destructive/10 text-destructive' },
  unblock: { icon: ShieldCheck, className: 'bg-success/10 text-success' },
  hide: { icon: EyeOff, className: 'bg-muted text-muted-foreground' },
  publish: { icon: Eye, className: 'bg-success/10 text-success' },
  assign_subscription: { icon: CalendarPlus, className: 'bg-primary/10 text-primary' },
  renew_subscription: { icon: RotateCcw, className: 'bg-primary/10 text-primary' },
  extend_subscription: { icon: CalendarClock, className: 'bg-secondary/20 text-secondary-foreground' },
  cancel_subscription: { icon: XCircle, className: 'bg-destructive/10 text-destructive' },
  create_payment: { icon: Wallet, className: 'bg-success/10 text-success' },
  refund_payment: { icon: CreditCard, className: 'bg-orange-500/10 text-orange-600' },
  update_settings: { icon: Settings2, className: 'bg-secondary/20 text-secondary-foreground' },
  submit_profile_change: { icon: Send, className: 'bg-primary/10 text-primary' },
  approve_profile_change: { icon: CheckCircle2, className: 'bg-success/10 text-success' },
  reject_profile_change: { icon: XCircle, className: 'bg-destructive/10 text-destructive' },
  new_profile_submitted: { icon: Send, className: 'bg-primary/10 text-primary' },
  new_profile_resubmitted: { icon: RotateCcw, className: 'bg-primary/10 text-primary' },
  new_profile_approved: { icon: UserCheck, className: 'bg-success/10 text-success' },
  new_profile_rejected: { icon: UserX, className: 'bg-destructive/10 text-destructive' },
}

const ACTION_LABELS = Object.fromEntries(ACTIVITY_ACTIONS.map((option) => [option.value, option.label]))

export default function ActivityBadge({ action, className }) {
  const meta = ACTION_META[action] || { icon: KeyRound, className: 'bg-muted text-muted-foreground' }
  const Icon = meta.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        meta.className,
        className
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {ACTION_LABELS[action] || action || 'Unknown'}
    </span>
  )
}
