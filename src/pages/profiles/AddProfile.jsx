import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { CircleAlert, Loader2, Search, UserCheck, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ProfileForm from '@/components/profiles/ProfileForm'
import { useAuth } from '@/hooks/useAuth'
import { searchUsersOnce } from '@/services/userService'
import { generateProfileId, createLinkedUser } from '@/services/profileService'
import { GENDER_OPTIONS } from '@/constants/profileOptions'

function ExistingUserPicker({ onSelect }) {
  const [term, setTerm] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch(event) {
    event.preventDefault()
    if (!term.trim()) return
    setSearching(true)
    try {
      setResults(await searchUsersOnce(term))
      setSearched(true)
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Search by name, phone, or email…"
        />
        <Button type="submit" disabled={searching} className="gap-1.5">
          {searching ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Search className="size-4" aria-hidden="true" />
          )}
          Search
        </Button>
      </form>

      {searched && results.length === 0 && !searching && (
        <p className="text-sm text-muted-foreground">No matching users found.</p>
      )}

      {results.length > 0 && (
        <ul className="divide-y divide-border rounded-lg border border-border/70">
          {results.map((user) => (
            <li key={user.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{user.name || '—'}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email} · {user.phone}
                </p>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={() => onSelect(user)}>
                Select
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function NewUserForm({ onCreated, admin }) {
  const [submitError, setSubmitError] = useState(null)
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { name: '', email: '', phone: '', tempPassword: '', gender: '' } })

  async function onSubmit(data) {
    setSubmitError(null)
    try {
      const uid = await createLinkedUser({ ...data, admin })
      onCreated({ uid, ...data })
    } catch (error) {
      setSubmitError(error.message || 'Could not create user. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {submitError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{submitError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="new-user-name">Name *</Label>
          <Input id="new-user-name" {...register('name', { required: 'Name is required.' })} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="new-user-email">Email *</Label>
          <Input
            id="new-user-email"
            type="email"
            {...register('email', {
              required: 'Email is required.',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address.' },
            })}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="new-user-phone">Phone *</Label>
          <Input id="new-user-phone" {...register('phone', { required: 'Phone is required.' })} />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="new-user-password">Temporary Password *</Label>
          <Input
            id="new-user-password"
            type="text"
            {...register('tempPassword', {
              required: 'Temporary password is required.',
              minLength: { value: 6, message: 'Must be at least 6 characters.' },
            })}
          />
          {errors.tempPassword && (
            <p className="text-xs text-destructive">{errors.tempPassword.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="new-user-gender">Gender *</Label>
          <Controller
            name="gender"
            control={control}
            rules={{ required: 'Gender is required.' }}
            render={({ field }) => (
              <Select value={field.value || ''} onValueChange={field.onChange}>
                <SelectTrigger id="new-user-gender">
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.gender && <p className="text-xs text-destructive">{errors.gender.message}</p>}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="gap-1.5">
        {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        Create User & Continue
      </Button>
    </form>
  )
}

export default function AddProfile() {
  const { currentAdmin } = useAuth()
  const navigate = useNavigate()

  const [profileId] = useState(() => generateProfileId())
  const [linkMode, setLinkMode] = useState('existing')
  const [linkedUser, setLinkedUser] = useState(null)
  const [createdNewUser, setCreatedNewUser] = useState(false)

  function handleExistingSelected(user) {
    setLinkedUser({ uid: user.id, name: user.name, email: user.email, phone: user.phone, gender: user.gender })
    setCreatedNewUser(false)
  }

  function handleNewUserCreated(user) {
    setLinkedUser(user)
    setCreatedNewUser(true)
  }

  function handleSaved({ status }) {
    const message = createdNewUser
      ? 'User and Profile created successfully.'
      : status === 'draft'
        ? 'Profile saved as draft.'
        : 'Profile published successfully.'
    navigate('/profiles', { state: { successMessage: message } })
  }

  if (!linkedUser) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Add Profile</h1>
          <p className="text-sm text-muted-foreground">
            Every profile must be linked to a user account — select an existing one or create a
            new one to get started.
          </p>
        </div>

        <Card className="border-border/70 shadow-sm">
          <CardHeader className="gap-3">
            <CardTitle className="font-heading text-lg text-foreground">Link a User</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={linkMode === 'existing' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLinkMode('existing')}
                className="gap-1.5"
              >
                <UserCheck className="size-4" aria-hidden="true" />
                Select Existing User
              </Button>
              <Button
                type="button"
                variant={linkMode === 'new' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLinkMode('new')}
                className="gap-1.5"
              >
                <UserPlus className="size-4" aria-hidden="true" />
                Create New User
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {linkMode === 'existing' ? (
              <ExistingUserPicker onSelect={handleExistingSelected} />
            ) : (
              <>
                <CardDescription className="mb-4">
                  Creates a Firebase Authentication account and a Firestore user record, then
                  links the new profile to it.
                </CardDescription>
                <NewUserForm onCreated={handleNewUserCreated} admin={currentAdmin} />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Add Profile</h1>
        <p className="text-sm text-muted-foreground">
          Fill in as much as you have — everything except Full Name, Gender, and Mobile Number is
          optional, and you can Save as Draft anytime.
        </p>
      </div>

      <ProfileForm mode="create" profileId={profileId} linkedUser={linkedUser} onSaved={handleSaved} />
    </div>
  )
}
