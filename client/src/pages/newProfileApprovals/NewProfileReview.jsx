import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CircleAlert, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import ProfileSection from '@/components/profiles/ProfileSection'
import ProfileStatusBadge from '@/components/profiles/ProfileStatusBadge'
import ProfileDetails from '@/components/profiles/ProfileDetails'
import ApproveNewProfileDialog from '@/components/newProfileApprovals/ApproveNewProfileDialog'
import RejectNewProfileDialog from '@/components/newProfileApprovals/RejectNewProfileDialog'
import { getNewProfileById, approveNewProfile, rejectNewProfile } from '@/services/newProfileApprovalService'
import { getUserById } from '@/services/userService'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/utils/helpers'
import { calculateProfileCompletion } from '@/utils/profileCompletion'

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
  const { currentAdmin } = useAuth()

  const [profile, setProfile] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    getNewProfileById(profileId)
      .then(async (data) => {
        if (cancelled) return
        if (!data) {
          setError('Profile not found.')
          return
        }
        setProfile(data)
        const userData = data.userId ? await getUserById(data.userId) : null
        if (cancelled) return
        setUser(userData)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not load this profile.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [profileId])

  async function handleApprove() {
    await approveNewProfile(profileId, { admin: currentAdmin })
    navigate('/profiles/new-approvals', { state: { successMessage: 'Profile approved.' } })
  }

  async function handleReject(rejectionReason) {
    await rejectNewProfile(profileId, { admin: currentAdmin, rejectionReason })
    navigate('/profiles/new-approvals', { state: { successMessage: 'Profile rejected.' } })
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div
        role="alert"
        className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
      >
        <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>{error || 'Profile not found.'}</span>
      </div>
    )
  }

  const system = profile.system || {}
  const isPending = system.status === 'pending_approval'
  const completion = calculateProfileCompletion(profile)

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex size-16 items-center justify-center overflow-hidden rounded-full bg-muted">
            {profile.photos?.main?.url ? (
              <img src={profile.photos.main.url} alt="" className="size-full object-cover" />
            ) : (
              <UserRound className="size-7 text-muted-foreground" aria-hidden="true" />
            )}
          </div>
          <div>
            <h1 className="font-heading text-2xl font-semibold text-foreground">
              {profile.personal?.fullName || 'Unnamed Profile'}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <ProfileStatusBadge status={system.status} />
              <span className="text-xs text-muted-foreground">{completion}% complete</span>
              <span className="text-xs text-muted-foreground">Submitted {formatDate(system.submittedAt)}</span>
            </div>
          </div>
        </div>

        {isPending && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setRejectOpen(true)}
            >
              Reject
            </Button>
            <Button onClick={() => setApproveOpen(true)}>Approve Profile</Button>
          </div>
        )}
      </div>

      {system.status === 'rejected' && system.rejectionReason && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>Rejection reason: {system.rejectionReason}</span>
        </div>
      )}

      <ProfileSection title="User Information">
        <Row label="Name" value={user?.name} />
        <Row label="Email" value={user?.email} />
        <Row label="Phone" value={user?.phone} />
        <Row label="Account Status" value={user?.status} />
        <Row label="Created Date" value={formatDate(user?.createdAt)} />
        {profile.userId && (
          <Button asChild variant="outline" size="sm" className="mt-3 gap-1.5">
            <Link to={`/users/${profile.userId}`}>View User</Link>
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
