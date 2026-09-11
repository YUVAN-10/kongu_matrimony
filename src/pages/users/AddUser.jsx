import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { CircleAlert, Loader2, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createUser } from '@/services/userService'

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
]

export default function AddUser() {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState(null)
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { name: '', email: '', phone: '', tempPassword: '', gender: 'MALE', city: '' },
  })

  async function onSubmit(data) {
    setSubmitError(null)
    try {
      await createUser(data)
      navigate('/users', {
        state: { successMessage: `User "${data.name}" created successfully!` },
      })
    } catch (error) {
      setSubmitError(error?.message || 'Could not create user. Please verify the information.')
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Add User</h1>
        <p className="text-sm text-muted-foreground">
          Create a new user account with temporary login credentials.
        </p>
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-lg text-foreground">
            <UserPlus className="size-5 text-primary" />
            User Account Details
          </CardTitle>
          <CardDescription>
            Creates a user account and auto-initializes their matrimonial profile.
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="add-user-name">Full Name *</Label>
                <Input
                  id="add-user-name"
                  placeholder="Enter full name"
                  {...register('name', { required: 'Full name is required.' })}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="add-user-email">Email Address *</Label>
                <Input
                  id="add-user-email"
                  type="email"
                  placeholder="Enter email address"
                  {...register('email', {
                    required: 'Email is required.',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address.' },
                  })}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="add-user-phone">Mobile Number *</Label>
                <Input
                  id="add-user-phone"
                  placeholder="Enter mobile number"
                  {...register('phone', {
                    required: 'Mobile number is required.',
                    minLength: { value: 10, message: 'Must be at least 10 digits.' },
                  })}
                />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="add-user-password">Temporary Password *</Label>
                <Input
                  id="add-user-password"
                  type="text"
                  placeholder="Enter temporary password"
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
                    <Select value={field.value || 'MALE'} onValueChange={field.onChange}>
                      <SelectTrigger id="add-user-gender">
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
                <Label htmlFor="add-user-city">City</Label>
                <Input id="add-user-city" placeholder="Enter city" {...register('city')} />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
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