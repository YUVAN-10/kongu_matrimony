import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CircleAlert, EyeOff, Pencil, RotateCcw, Trash2, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import ProfileStatusBadge from '@/components/profiles/ProfileStatusBadge'
import ProfileDetails from '@/components/profiles/ProfileDetails'
import DeleteProfileDialog from '@/components/profiles/DeleteProfileDialog'
import { getProfileById, hideProfile, restoreProfile, softDeleteProfile } from '@/services/profileService'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/utils/helpers'

export default function ViewProfile() {
  const { profileId } = useParams()
  const navigate = useNavigate()
  const { currentAdmin } = useAuth()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getProfileById(profileId)
      .then((data) => {
        if (cancelled) return
        if (!data) setError('Profile not found.')
        else setProfile(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not load profile.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [profileId])

  async function handleHide() {
    await hideProfile(profileId, { admin: currentAdmin })
    setProfile((prev) => ({ ...prev, system: { ...prev.system, status: 'hidden' } }))
  }
  async function handleRestore() {
    await restoreProfile(profileId, { admin: currentAdmin })
    setProfile((prev) => ({ ...prev, system: { ...prev.system, status: 'active' } }))
  }
  async function handleDeleteConfirm() {
    await softDeleteProfile(profileId, { admin: currentAdmin })
    navigate('/profiles', { state: { successMessage: 'Profile deleted.' } })
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

  const { personal = {}, photos = {}, system = {} } = profile

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex size-16 items-center justify-center overflow-hidden rounded-full bg-muted">
            {photos.main?.url ? (
              <img src={photos.main.url} alt="" className="size-full object-cover" />
            ) : (
              <UserRound className="size-7 text-muted-foreground" aria-hidden="true" />
            )}
          </div>
          <div>
            <h1 className="font-heading text-2xl font-semibold text-foreground">
              {personal.fullName || 'Unnamed Profile'}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <ProfileStatusBadge status={system.status} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link to={`/profiles/${profileId}/edit`}>
              <Pencil className="size-4" aria-hidden="true" />
              Edit
            </Link>
          </Button>
          {system.status === 'active' && (
            <Button variant="outline" size="sm" onClick={handleHide} className="gap-1.5">
              <EyeOff className="size-4" aria-hidden="true" />
              Hide
            </Button>
          )}
          {(system.status === 'hidden' || system.status === 'deleted') && (
            <Button variant="outline" size="sm" onClick={handleRestore} className="gap-1.5">
              <RotateCcw className="size-4" aria-hidden="true" />
              Restore
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Delete
          </Button>
        </div>
      </div>

      <ProfileDetails profile={profile} />

      <p className="text-xs text-muted-foreground">
        Created by {system.createdBy || 'Unknown'} on {formatDate(system.createdAt)}
        {system.publishedAt && ` · Published ${formatDate(system.publishedAt)}`}
      </p>

      <DeleteProfileDialog
        profile={profile}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
