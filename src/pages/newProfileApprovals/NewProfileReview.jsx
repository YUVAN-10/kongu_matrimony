import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { CircleAlert, UserRound, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import ProfileSection from '@/components/profiles/ProfileSection'
import ProfileStatusBadge from '@/components/profiles/ProfileStatusBadge'
import ProfileDetails from '@/components/profiles/ProfileDetails'
import ApproveNewProfileDialog from '@/components/newProfileApprovals/ApproveNewProfileDialog'
import RejectNewProfileDialog from '@/components/newProfileApprovals/RejectNewProfileDialog'
import { getNewProfileApprovals, approveNewProfile, rejectNewProfile } from '@/services/newProfileApprovalService'
import { getUserById } from '@/services/userService'
import { formatDate } from '@/utils/helpers'

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium text-foreground">{value ?? '—'}</span>
    </div>
  )
}

export default function NewProfileReview() {
  const { profileId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [profile, setProfile] = useState(location.state?.profile || null)
  const [user, setUser] = useState(location.state?.profile?.user || null)
  const [loading, setLoading] = useState(!location.state?.profile)
  const [error, setError] = useState(null)

  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      if (profile && user) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      try {
        const res = await getNewProfileApprovals({ page: 1, limit: 100 })
        const found = res.profiles?.find((p) => p.id === profileId)
        if (cancelled) return

        if (!found) {
          setError('Profile not found in pending approvals.')
          return
        }

        setProfile(found)
        if (found.user) {
          setUser(found.user)
        } else if (found.userId) {
          const u = await getUserById(found.userId).catch(() => null)
          if (!cancelled && u) setUser(u)
        }
      } catch (err) {
        if (!cancelled) {
          setError(typeof err === 'string' ? err : err?.message || 'Could not load this profile.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadProfile()

    return () => {
      cancelled = true
    }
  }, [profileId])

  async function handleApprove() {
    await approveNewProfile(profileId)
    navigate('/profiles/new-approvals', { state: { successMessage: 'Profile approved successfully.' } })
  }

  async function handleReject() {
    await rejectNewProfile(profileId)
    navigate('/profiles/new-approvals', { state: { successMessage: 'Profile rejected.' } })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/profiles/new-approvals')} className="gap-1.5">
          <ArrowLeft className="size-4" />
          Back to Approvals
        </Button>
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{typeof error === 'string' ? error : error?.message || 'Profile not found.'}</span>
        </div>
      </div>
    )
  }

  const name = profile.fullName || profile.personal?.fullName || 'Unnamed Profile'
  const photo = profile.profileImageUrl || profile.photos?.main?.url
  const status = profile.approvalStatus || profile.status || 'PENDING'
  const isPending = status === 'PENDING'

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/profiles/new-approvals')} className="size-8">
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex size-14 items-center justify-center overflow-hidden rounded-full bg-muted border border-border">
            {photo ? (
              <img src={photo} alt={name} className="size-full object-cover" />
            ) : (
              <UserRound className="size-7 text-muted-foreground" aria-hidden="true" />
            )}
          </div>
          <div>
            <h1 className="font-heading text-2xl font-semibold text-foreground">
              {name}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                {status}
              </span>
              <span className="text-xs text-muted-foreground">Submitted {formatDate(profile.createdAt)}</span>
            </div>
          </div>
        </div>

        {isPending && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={() => setRejectOpen(true)}
            >
              Reject
            </Button>
            <Button onClick={() => setApproveOpen(true)}>Approve Profile</Button>
          </div>
        )}
      </div>

      <ProfileSection title="Registered User Information">
        <Row label="Name" value={user?.name || profile.user?.name} />
        <Row label="Email" value={user?.email || profile.user?.email} />
        <Row label="Phone" value={user?.phone || user?.mobile || profile.user?.mobile} />
        <Row label="Account Status" value={user?.status || profile.user?.status} />
        {profile.userId && (
          <Button asChild variant="outline" size="sm" className="mt-3 gap-1.5">
            <Link to={`/users/${profile.userId}`}>View Full User Details</Link>
          </Button>
        )}
      </ProfileSection>

      <ProfileDetails profile={profile} />

      <ApproveNewProfileDialog
        profile={profile}
        open={approveOpen}
        onOpenChange={setApproveOpen}
        onConfirm={handleApprove}
      />
      <RejectNewProfileDialog
        profile={profile}
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onConfirm={handleReject}
      />
    </div>
  )
}
