import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, UserPlus, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createUser } from '@/services/userService'

export default function AddUser() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: 'MALE',
    city: '',
    email: '',
    tempPassword: 'Password123',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  function handleChange(field, value) {
    if (field === 'phone') {
      const cleanValue = value.replace(/\D/g, '').slice(0, 10)
      setFormData((prev) => ({ ...prev, phone: cleanValue }))
      if (cleanValue.length > 0 && cleanValue.length !== 10) {
        setFieldErrors((prev) => ({ ...prev, phone: 'Only 10 digits allowed.' }))
      } else {
        setFieldErrors((prev) => ({ ...prev, phone: null }))
      }
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
      if (fieldErrors[field]) {
        setFieldErrors((prev) => ({ ...prev, [field]: null }))
      }
    }
    if (error) setError(null)
  }

  function validateForm() {
    const errors = {}

    if (!formData.name.trim()) {
      errors.name = 'Full Name is required.'
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone Number is required.'
    } else if (formData.phone.length !== 10) {
      errors.phone = 'Only 10 digits allowed.'
    }

    if (!formData.city.trim()) {
      errors.city = 'City is required.'
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.'
    }

    if (!formData.tempPassword || formData.tempPassword.length < 6) {
      errors.tempPassword = 'Password must be at least 6 characters.'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!validateForm()) {
      setError('Please fix the errors in the form before submitting.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await createUser({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        gender: formData.gender,
        city: formData.city.trim(),
        email: formData.email.trim() || undefined,
        tempPassword: formData.tempPassword || 'Password123',
      })

      navigate('/users', {
        state: {
          successMessage: `User "${formData.name.trim()}" created successfully!`,
        },
      })
    } catch (err) {
      setError(typeof err === 'string' ? err : err?.message || 'Failed to create user. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/users')} className="size-8">
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Add New User</h1>
          <p className="text-sm text-muted-foreground">
            Create a new user account with basic profile information.
          </p>
        </div>
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-lg text-foreground">
            <UserPlus className="size-5 text-primary" />
            User Registration Form
          </CardTitle>
          <CardDescription>
            Enter user credentials and mandatory personal details.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {/* 1. Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
                {fieldErrors.name && (
                  <p className="text-xs text-destructive">{fieldErrors.name}</p>
                )}
              </div>

              {/* 2. Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  maxLength={10}
                  inputMode="numeric"
                />
                {fieldErrors.phone && (
                  <p className="text-xs text-destructive">{fieldErrors.phone}</p>
                )}
              </div>

              {/* 3. Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender">
                  Gender <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.gender} onValueChange={(val) => handleChange('gender', val)}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                  </SelectContent>
                </Select>
                {fieldErrors.gender && (
                  <p className="text-xs text-destructive">{fieldErrors.gender}</p>
                )}
              </div>

              {/* 4. City */}
              <div className="space-y-2">
                <Label htmlFor="city">
                  City <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="city"
                  placeholder="e.g. Chennai"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                />
                {fieldErrors.city && (
                  <p className="text-xs text-destructive">{fieldErrors.city}</p>
                )}
              </div>

              {/* 5. Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g. john@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
                {fieldErrors.email && (
                  <p className="text-xs text-destructive">{fieldErrors.email}</p>
                )}
              </div>

              {/* 6. Temporary Password */}
              <div className="space-y-2">
                <Label htmlFor="tempPassword">Temporary Password</Label>
                <Input
                  id="tempPassword"
                  type="text"
                  placeholder="Password123"
                  value={formData.tempPassword}
                  onChange={(e) => handleChange('tempPassword', e.target.value)}
                />
                {fieldErrors.tempPassword && (
                  <p className="text-xs text-destructive">{fieldErrors.tempPassword}</p>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between border-t bg-muted/20 px-6 py-4">
            <Button type="button" variant="outline" onClick={() => navigate('/users')}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Creating User...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 size-4" />
                  Create User
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}