import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CircleAlert } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import ProfileForm from '@/components/profiles/ProfileForm'
import { getProfileById } from '@/services/profileService'

export default function EditProfile() {
  const { profileId } = useParams()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    getProfileById(profileId)
      .then((data) => {
        if (cancelled) return
        if (!data) {
          setError('Profile not found.')
        } else {
          setProfile(data)
        }
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

  function handleSaved({ status }) {
    const message = status === 'draft' ? 'Profile saved as draft.' : 'Profile updated successfully.'
    navigate('/profiles', { state: { successMessage: message } })
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Edit Profile</h1>
        <p className="text-sm text-muted-foreground">
          {profile?.personal?.fullName || 'Update the profile details below.'}
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : error ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : (
        <ProfileForm mode="edit" profileId={profileId} initialValues={profile} onSaved={handleSaved} />
      )}
    </div>
  )
}
