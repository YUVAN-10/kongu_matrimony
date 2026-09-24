import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Crown,
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
import ProfileDetails from '@/components/profiles/ProfileDetails'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import { getUserById, blockUser, unblockUser } from '@/services/userService'
import { formatDate } from '@/utils/helpers'

export default function UserDetails({ userId, open, onOpenChange, onStatusChange }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (!open || !userId) return

    let cancelled = false
    setLoading(true)
    setUser(null)
    setProfile(null)

    getUserById(userId)
      .then((userData) => {
        if (cancelled) return
        setUser(userData)
        setProfile(userData?.profile || userData)
      })
      .catch(() => null)
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [userId, open, location.key, location.state])

  useEffect(() => {
    function handleProfileUpdated(e) {
      if (!open || !userId) return
      if (!e.detail?.profileId || e.detail.profileId === userId) {
        getUserById(userId)
          .then((userData) => {
            if (userData) {
              setUser(userData)
              setProfile(userData?.profile || userData)
            }
          })
          .catch(() => null)
      }
    }
    window.addEventListener('profile-updated', handleProfileUpdated)
    return () => window.removeEventListener('profile-updated', handleProfileUpdated)
  }, [userId, open])

  const userName = user?.fullName || user?.name || 'User'

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
  const mergedProfile = profile || user?.profile || user

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-4xl lg:max-w-5xl overflow-y-auto">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="font-heading text-xl">Full User & Profile Details</SheetTitle>
          <SheetDescription>View complete personal, physical, astrology, education, family, and account information.</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 pt-4">
          {loading ? (
            <div className="space-y-4 pt-4">
              <Skeleton className="mx-auto size-20 rounded-full" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-32 w-full" />
                ))}
              </div>
            </div>
          ) : !user ? (
            <p className="py-10 text-center text-sm text-muted-foreground">User not found.</p>
          ) : (
            <div className="space-y-6">
              {/* Account Summary Header Card */}
              <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-border/70 bg-card p-5 shadow-sm sm:flex-row">
                <div className="flex items-center gap-4">
                  <Avatar className="size-16 border-2 border-border shadow-sm">
                    <AvatarImage src={user.profileImageUrl || user.photoURL} alt={userName} />
                    <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
                      {userName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-heading text-xl font-semibold text-foreground">{userName}</h2>
                    <p className="text-xs text-muted-foreground">{user.email} • {user.phone}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
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
                      {user.profileStatus && (
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                            user.profileStatus === 'DRAFT'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                              : 'bg-success/15 text-success border border-success/30'
                          }`}
                        >
                          {user.profileStatus === 'DRAFT' ? 'Draft Profile' : 'Active Profile'}
                        </span>
                      )}
                      {user.isPremium && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                          <Crown className="size-3" />
                          Premium
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">Joined {formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onOpenChange(false)
                      navigate(`/users/${user.id}/edit`)
                    }}
                    className="gap-1.5"
                  >
                    <Pencil className="size-4" />
                    Edit Full Profile
                  </Button>
                  <Button
                    size="sm"
                    variant={isBlocked ? 'default' : 'destructive'}
                    onClick={handleToggleStatus}
                    disabled={actionLoading}
                    className={`gap-1.5 ${isBlocked ? 'bg-success hover:bg-success/90 text-white' : ''}`}
                  >
                    {actionLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : isBlocked ? (
                      <>
                        <ShieldCheck className="size-4" />
                        Unblock User
                      </>
                    ) : (
                      <>
                        <Ban className="size-4" />
                        Block User
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Full Profile Details Component */}
              <ErrorBoundary>
                <ProfileDetails profile={mergedProfile} />
              </ErrorBoundary>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
