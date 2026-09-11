import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Crown,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Ban,
  Pencil,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getUserById, blockUser, unblockUser } from '@/services/userService'
import { formatDate } from '@/utils/helpers'

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-2.5 text-sm last:border-0">
      <span className="flex items-center gap-2 text-muted-foreground">
        {Icon && <Icon className="size-4 text-muted-foreground/70" />}
        {label}
      </span>
      <span className="truncate font-medium text-foreground">{value ?? '—'}</span>
    </div>
  )
}

export default function UserDetails({ userId, open, onOpenChange, onStatusChange }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (!open || !userId) return

    let cancelled = false
    setLoading(true)
    setUser(null)

    getUserById(userId)
      .then((data) => {
        if (!cancelled) setUser(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [userId, open])

  async function handleToggleStatus() {
    if (!user) return
    const isBlocked = user.status === 'BLOCKED'
    setActionLoading(true)
    try {
      if (isBlocked) {
        await unblockUser(user.id)
        setUser((prev) => ({ ...prev, status: 'ACTIVE', isBlocked: false }))
      } else {
        await blockUser(user.id)
        setUser((prev) => ({ ...prev, status: 'BLOCKED', isBlocked: true }))
      }
      if (onStatusChange) onStatusChange()
    } catch (err) {
      console.error('Failed to change user status:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const isBlocked = user?.status === 'BLOCKED'

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-heading">User Details</SheetTitle>
          <SheetDescription>Profile & account information</SheetDescription>
        </SheetHeader>

        <div className="overflow-y-auto px-4 pb-6">
          {loading ? (
            <div className="space-y-4 pt-4">
              <Skeleton className="mx-auto size-20 rounded-full" />
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-8 w-full" />
              ))}
            </div>
          ) : !user ? (
            <p className="py-10 text-center text-sm text-muted-foreground">User not found.</p>
          ) : (
            <div className="space-y-6 pt-2">
              <div className="flex flex-col items-center gap-2">
                <Avatar className="size-20 border-2 border-border shadow-sm">
                  <AvatarImage src={user.profileImageUrl || user.photoURL} alt={user.name} />
                  <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
                    {(user.name || 'U').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <p className="font-heading text-lg font-semibold text-foreground">{user.name}</p>
                  <div className="mt-1 flex items-center justify-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        user.status === 'ACTIVE'
                          ? 'bg-success/15 text-success border border-success/30'
                          : 'bg-destructive/15 text-destructive border border-destructive/30'
                      }`}
                    >
                      {user.status === 'ACTIVE' ? (
                        <CheckCircle2 className="size-3" />
                      ) : (
                        <ShieldAlert className="size-3" />
                      )}
                      {user.status}
                    </span>
                    {user.isPremium && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                        <Crown className="size-3" />
                        Premium
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Action Buttons inside drawer */}
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onOpenChange(false)
                      navigate(`/users/${user.id}/edit`)
                    }}
                    className="gap-1 text-xs"
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant={isBlocked ? 'default' : 'destructive'}
                    onClick={handleToggleStatus}
                    disabled={actionLoading}
                    className={`gap-1 text-xs ${isBlocked ? 'bg-success hover:bg-success/90 text-white' : ''}`}
                  >
                    {actionLoading ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : isBlocked ? (
                      <>
                        <ShieldCheck className="size-3.5" />
                        Unblock User
                      </>
                    ) : (
                      <>
                        <Ban className="size-3.5" />
                        Block User
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
                <h3 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Contact & Demographics
                </h3>
                <DetailRow icon={Mail} label="Email" value={user.email} />
                <DetailRow icon={Phone} label="Phone" value={user.phone} />
                <DetailRow icon={UserIcon} label="Gender" value={user.gender} />
                <DetailRow icon={MapPin} label="City" value={user.city} />
              </div>

              <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
                <h3 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Account Info
                </h3>
                <DetailRow icon={Calendar} label="Registered On" value={formatDate(user.createdAt)} />
                <DetailRow
                  icon={Crown}
                  label="Subscription"
                  value={user.isPremium ? 'Active (Premium)' : 'Free Tier'}
                />
                <DetailRow icon={Shield} label="Role" value={user.role} />
              </div>

              {user.subscriptions?.length > 0 && (
                <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
                  <h3 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Current Plan
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-foreground">
                      {user.subscriptions[0]?.plan?.name || user.subscriptions[0]?.planCode}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Expires: {formatDate(user.subscriptions[0]?.expiresAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
