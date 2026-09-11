import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { CircleAlert, Loader2, UserCog } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getUserById, updateUser } from '@/services/userService'

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
]

export default function EditUser() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState(null)
  const [loading, setLoading] = useState(true)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      gender: 'MALE',
      city: '',
    },
  })

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    setLoading(true)
    getUserById(userId)
      .then((user) => {
        if (cancelled) return
        if (!user) {
          setSubmitError('User not found.')
          return
        }
        reset({
          name: user.name !== '—' ? user.name : '',
          email: user.email !== '—' ? user.email : '',
          phone: user.phone !== '—' ? user.phone : '',
          gender: user.gender || 'MALE',
          city: user.city !== '—' ? user.city : '',
        })
      })
      .catch((error) => {
        if (!cancelled) {
          setSubmitError(error?.message || 'Could not load user.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [userId, reset])

  async function onSubmit(data) {
    setSubmitError(null)
    try {
      await updateUser(userId, data)
      navigate('/users', {
        state: { successMessage: `User "${data.name}" updated successfully.` },
      })
    } catch (error) {
      setSubmitError(error?.message || 'Could not update user. Please try again.')
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Edit User</h1>
        <p className="text-sm text-muted-foreground">Update user details and contact info.</p>
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-lg text-foreground">
            <UserCog className="size-5 text-primary" />
            Edit User Profile
          </CardTitle>
          <CardDescription>Update name, email, phone number, gender, and city.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
            </div>
          ) : (
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
                  <Label htmlFor="edit-user-name">Full Name *</Label>
                  <Input id="edit-user-name" {...register('name', { required: 'Full name is required.' })} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-user-email">Email Address *</Label>
                  <Input
                    id="edit-user-email"
                    type="email"
                    {...register('email', {
                      required: 'Email is required.',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address.' },
                    })}
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-user-phone">Mobile Number *</Label>
                  <Input id="edit-user-phone" {...register('phone', { required: 'Phone number is required.' })} />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-user-gender">Gender *</Label>
                  <Controller
                    name="gender"
                    control={control}
                    rules={{ required: 'Gender is required.' }}
                    render={({ field }) => (
                      <Select value={field.value || 'MALE'} onValueChange={field.onChange}>
                        <SelectTrigger id="edit-user-gender">
                          <SelectValue placeholder="Select gender" />
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
                  <Label htmlFor="edit-user-city">City</Label>
                  <Input id="edit-user-city" {...register('city')} />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button type="submit" disabled={isSubmitting} className="gap-1.5">
                  {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                  Save Changes
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/users')}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
