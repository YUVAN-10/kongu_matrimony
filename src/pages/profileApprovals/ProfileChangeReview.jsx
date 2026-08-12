import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CircleAlert, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import ProfileSection from '@/components/profiles/ProfileSection'
import ChangeComparison from '@/components/profileApprovals/ChangeComparison'
import ChangeRequestStatusBadge from '@/components/profileApprovals/ChangeRequestStatusBadge'
import ApprovalDialog from '@/components/profileApprovals/ApprovalDialog'
import RejectionDialog from '@/components/profileApprovals/RejectionDialog'
import {
  getChangeRequestById,
  approveProfileChangeRequest,
  rejectProfileChangeRequest,
} from '@/services/profileChangeRequestService'
import { getProfileById } from '@/services/profileService'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/utils/helpers'
import { REJECTION_TYPE_OPTIONS } from '@/constants/changeRequestOptions'

const REJECTION_TYPE_LABELS = Object.fromEntries(REJECTION_TYPE_OPTIONS.map((o) => [o.value, o.label]))

export default function ProfileChangeReview() {
  const { requestId } = useParams()
  const navigate = useNavigate()
  const { currentAdmin } = useAuth()

  const [request, setRequest] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    getChangeRequestById(requestId)
      .then(async (data) => {
        if (cancelled) return
        if (!data) {
          setError('Change request not found.')
          return
        }
        setRequest(data)
        // Guard against a request document with a missing/blank profileId
        // (e.g. bad test data) — Firestore's doc() throws a raw, unfriendly
        // SDK error for an empty id, so skip the lookup entirely and just
        // fall back to the "Unnamed Profile" display.
        const profileData = data.profileId ? await getProfileById(data.profileId) : null
        if (cancelled) return
        setProfile(profileData)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not load this change request.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [requestId])

  async function handleApprove() {
    await approveProfileChangeRequest({ requestId, admin: currentAdmin })
    navigate('/profiles/change-approvals', { state: { successMessage: 'Profile changes approved.' } })
  }

  async function handleReject(rejectionType, rejectionReason) {
    await rejectProfileChangeRequest({ requestId, admin: currentAdmin, rejectionType, rejectionReason })
    navigate('/profiles/change-approvals', { state: { successMessage: 'Profile changes rejected.' } })
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !request) {
    return (
      <div
        role="alert"
        className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
      >
        <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>{error || 'Change request not found.'}</span>
      </div>
    )
  }

  const changeCount = Object.keys(request.changes || {}).length
  const isPending = request.status === 'pending'

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex size-16 items-center justify-center overflow-hidden rounded-full bg-muted">
            {profile?.photos?.main?.url ? (
              <img src={profile.photos.main.url} alt="" className="size-full object-cover" />
            ) : (
              <UserRound className="size-7 text-muted-foreground" aria-hidden="true" />
            )}
          </div>
          <div>
            <h1 className="font-heading text-2xl font-semibold text-foreground">
              {profile?.personal?.fullName || 'Unnamed Profile'}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <ChangeRequestStatusBadge status={request.status} />
              <span className="text-xs text-muted-foreground">{changeCount} change(s)</span>
              <span className="text-xs text-muted-foreground">
                Submitted {formatDate(request.submittedAt)}
              </span>
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
            <Button onClick={() => setApproveOpen(true)}>Approve</Button>
          </div>
        )}
      </div>

      {request.status === 'rejected' && request.rejectionReason && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div>
            {request.rejectionType && (
              <div className="font-medium">
                {REJECTION_TYPE_LABELS[request.rejectionType] || request.rejectionType}
              </div>
            )}
            <div>{request.rejectionReason}</div>
          </div>
        </div>
      )}

      <ProfileSection title="Change Summary" description="Only fields that were actually changed are shown.">
        <ChangeComparison changes={request.changes} />
      </ProfileSection>

      <ApprovalDialog
        request={{ ...request, profileName: profile?.personal?.fullName, changeCount }}
        open={approveOpen}
        onOpenChange={setApproveOpen}
        onConfirm={handleApprove}
      />
      <RejectionDialog
        request={{ ...request, profileName: profile?.personal?.fullName }}
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onConfirm={handleReject}
      />
    </div>
  )
}
