import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { CircleAlert, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/hooks/useAuth'
import { createLinkedUser } from '@/services/profileService'
import { searchUsersByPhone, searchUsersByEmail, searchUsersByName } from '@/services/userService'
import { GENDER_OPTIONS } from '@/constants/profileOptions'

export default function AddUser() {
  const { currentAdmin } = useAuth()
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState(null)
  const [nameDuplicateWarning, setNameDuplicateWarning] = useState(null)
  const {
    register,
    handleSubmit,
    control,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { name: '', email: '', phone: '', tempPassword: '', gender: '', city: '' },
  })

  async function createUser(data) {
    await createLinkedUser({ ...data, admin: currentAdmin })
    navigate('/profiles', { state: { successMessage: 'User created successfully. A draft profile has been created for this user.' } })
  }

  async function onSubmit(data, { skipNameCheck = false } = {}) {
    setSubmitError(null)
    try {
      // 1. Phone and email are strict — block on any match.
      const existingByPhone = await searchUsersByPhone(data.phone)
      if (existingByPhone.length > 0) {
        setSubmitError('A user with this phone number already exists.')
        return
      }

      const existingByEmail = await searchUsersByEmail(data.email)
      if (existingByEmail.length > 0) {
        setSubmitError('A user with this email address already exists.')
        return
      }

      // 2. Name is a warning only — let the admin confirm and proceed anyway.
      if (!skipNameCheck) {
        const existingByName = await searchUsersByName(data.name)
        if (existingByName.length > 0) {
          setNameDuplicateWarning(data.name)
          return
        }
      }

      await createUser(data)
    } catch (error) {
      setSubmitError(error.message || 'Could not create user. Please try again.')
    }
  }

  async function handleCreateAnyway() {
    setNameDuplicateWarning(null)
    await onSubmit(getValues(), { skipNameCheck: true })
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Add User</h1>
        <p className="text-sm text-muted-foreground">
          Create a new user account. Name, email, phone, temporary password, and gender are
          required.
        </p>
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-lg text-foreground">User Details</CardTitle>
          <CardDescription>
            Creates a Firebase Authentication account and a Firestore user record. The admin&apos;s
            own session is not affected.
          </CardDescription>
        </CardHeader>
        <CardContent>
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

            {nameDuplicateWarning && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-lg border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm"
              >
                <CircleAlert className="mt-0.5 size-4 shrink-0 text-secondary-foreground" aria-hidden="true" />
                <div className="flex-1 space-y-2">
                  <span>
                    A user named &quot;{nameDuplicateWarning}&quot; already exists. This might be a
                    different person with the same name — create anyway?
                  </span>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" onClick={handleCreateAnyway} disabled={isSubmitting}>
                      Create Anyway
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setNameDuplicateWarning(null)}
                    >
                      Let Me Check
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="add-user-name">Name *</Label>
                <Input id="add-user-name" {...register('name', { required: 'Name is required.' })} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="add-user-email">Email *</Label>
                <Input
                  id="add-user-email"
                  type="email"
                  {...register('email', {
                    required: 'Email is required.',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address.' },
                  })}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="add-user-phone">Phone *</Label>
                <Input id="add-user-phone" {...register('phone', { required: 'Phone is required.' })} />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="add-user-password">Temporary Password *</Label>
                <Input
                  id="add-user-password"
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
                <Label htmlFor="add-user-gender">Gender *</Label>
                <Controller
                  name="gender"
                  control={control}
                  rules={{ required: 'Gender is required.' }}
                  render={({ field }) => (
                    <Select value={field.value || ''} onValueChange={field.onChange}>
                      <SelectTrigger id="add-user-gender">
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

              <div className="space-y-1.5">
                <Label htmlFor="add-user-city">City</Label>
                <Input id="add-user-city" {...register('city')} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={isSubmitting} className="gap-1.5">
                {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                Create User
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/users')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}