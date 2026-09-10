import { useEffect, useState } from 'react'
import { User as UserIcon } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import UserStatusBadge from '@/components/users/UserStatusBadge'
import { getUserById } from '@/services/userService'
import { formatDate } from '@/utils/helpers'

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-2.5 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium text-foreground">{value ?? '—'}</span>
    </div>
  )
}

// Rendered as a Sheet (not a routed page) even though the file lives under
// pages/users/ per the requested structure — "Open inside a Sheet or Dialog"
// means transient overlay UI, not a full page navigation. Users.jsx still
// updates the URL to /users/:userId when it opens this, so it's deep-linkable.
export default function UserDetails({ userId, open, onOpenChange }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-heading">User Details</SheetTitle>
          <SheetDescription>Read-only snapshot of this user&apos;s record.</SheetDescription>
        </SheetHeader>

        <div className="overflow-y-auto px-4 pb-6">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="mx-auto size-20 rounded-full" />
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-8 w-full" />
              ))}
            </div>
          ) : !user ? (
            <p className="py-10 text-center text-sm text-muted-foreground">User not found.</p>
          ) : (
            <>
              <div className="mb-6 flex flex-col items-center gap-2">
                <div className="flex size-20 items-center justify-center overflow-hidden rounded-full bg-muted">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="size-full object-cover" />
                  ) : (
                    <UserIcon className="size-8 text-muted-foreground" aria-hidden="true" />
                  )}
                </div>
                <p className="font-heading text-lg font-semibold text-foreground">
                  {user.name || '—'}
                </p>
                <UserStatusBadge status={user.status} />
              </div>

              <DetailRow label="Email" value={user.email} />
              <DetailRow label="Phone" value={user.phone} />
              <DetailRow label="Gender" value={user.gender} />
              <DetailRow label="City" value={user.city} />
              <DetailRow label="Subscription" value={user.isPremium ? 'Premium' : 'Free'} />
              <DetailRow label="Registration Date" value={formatDate(user.createdAt)} />
              <DetailRow
                label="Last Login"
                value={user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
              />
              <DetailRow label="Created By" value={user.createdBy || 'Self-registered'} />
              {user.status === 'blocked' && (
                <DetailRow label="Block Reason" value={user.blockReason} />
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
