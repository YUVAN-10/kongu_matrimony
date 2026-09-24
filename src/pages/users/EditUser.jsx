import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CircleAlert, Loader2, UserCog, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import ProfileForm from '@/components/profiles/ProfileForm'
import { getUserById } from '@/services/userService'

export default function EditUser() {
  const { userId } = useParams()
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    setLoading(true)
    setSubmitError(null)

    async function loadData() {
      try {
        // Fetch only the live profile for Admin Edit Profile (GET /api/admin/users/:id)
        const userData = await getUserById(userId)

        if (cancelled) return

        if (!userData) {
          setSubmitError('User account not found.')
          return
        }

        setUser(userData)
        const merged = {
          ...userData,
          ...(userData.profile || {}),
        }
        setProfile(merged)
      } catch (error) {
        if (!cancelled) {
          setSubmitError(error?.message || 'Could not load user profile details.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [userId])

  function handleSaved(result) {
    const isDraft = result?.status === 'draft'

    const message = isDraft
      ? `Profile draft for "${user?.name || 'User'}" saved successfully.`
      : result?.isPartiallySaved
        ? 'Profile update partially saved. Backend did not persist some fields.'
        : 'Profile Updated Successfully.'

    navigate(isDraft ? '/users?tab=DRAFT' : `/users/${userId}`, {
      state: { successMessage: message },
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/users')} className="size-8">
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Edit Full Profile</h1>
          <p className="text-sm text-muted-foreground">
            Update complete profile sections, personal info, physical attributes, horoscope, education, family & photos.
          </p>
        </div>
      </div>

      <Card className="border-border/70 shadow-xs">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-lg text-foreground">
            <UserCog className="size-5 text-primary" />
            Full Profile Editor
          </CardTitle>
          <CardDescription>
            Editing user account: {user?.name || userId} ({user?.email})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
            </div>
          ) : submitError ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{submitError}</span>
            </div>
          ) : (
            <ProfileForm
              mode="edit"
              profileId={userId}
              initialValues={profile}
              linkedUser={user}
              onSaved={handleSaved}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

