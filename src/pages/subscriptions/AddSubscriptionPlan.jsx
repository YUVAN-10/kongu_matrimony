import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { CircleAlert, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import SubscriptionFeatureList from '@/components/subscriptions/SubscriptionFeatureList'
import { useAuth } from '@/hooks/useAuth'
import { createSubscriptionPlan } from '@/services/subscriptionService'
import { PLAN_STATUS_OPTIONS } from '@/constants/subscriptionOptions'

export default function AddSubscriptionPlan() {
  const { currentAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const preset = location.state?.preset

  const [submitError, setSubmitError] = useState(null)
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: preset || {
      code: '',
      name: '',
      price: '',
      validityDays: '',
      searchResultLimit: '',
      contactQuota: '',
      photoLimit: 5,
      sortOrder: 0,
      status: 'active',
      features: [],
    },
  })

  const features = watch('features') || []

  async function onSubmit(data) {
    setSubmitError(null)
    try {
      const createdCode = await createSubscriptionPlan(data, { admin: currentAdmin })
      navigate('/subscription-plans', {
        state: { successMessage: `Plan "${data.name || createdCode}" created successfully.` },
      })
    } catch (error) {
      setSubmitError(error.message || 'Could not create plan. Please try again.')
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Add Subscription Plan</h1>
        <p className="text-sm text-muted-foreground">Configure plan code, pricing, quotas, and feature tags.</p>
      </div>

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

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-foreground">Plan Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="code">Plan Code *</Label>
              <Input
                id="code"
                placeholder="e.g. PLATINUM, GOLD_VIP, FREE"
                {...register('code', {
                  required: 'Plan code is required.',
                  pattern: {
                    value: /^[A-Za-z0-9_-]+$/,
                    message: 'Code can only contain letters, numbers, hyphens, and underscores.',
                  },
                })}
                onChange={(e) => {
                  setValue('code', e.target.value.toUpperCase())
                }}
              />
              {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name">Plan Display Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Platinum VIP Plan"
                {...register('name', { required: 'Plan name is required.' })}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="price">Price (₹ INR) *</Label>
              <Input
                id="price"
                type="number"
                step="1"
                min="0"
                placeholder="e.g. 1999 (0 for Free)"
                {...register('price', {
                  required: 'Price is required.',
                  valueAsNumber: true,
                  min: { value: 0, message: 'Price cannot be negative.' },
                })}
              />
              {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="validityDays">Validity (Days) *</Label>
              <Input
                id="validityDays"
                type="number"
                min="1"
                placeholder="e.g. 90, 180, 365"
                {...register('validityDays', {
                  required: 'Validity in days is required.',
                  valueAsNumber: true,
                  min: { value: 1, message: 'Validity must be at least 1 day.' },
                })}
              />
              {errors.validityDays && (
                <p className="text-xs text-destructive">{errors.validityDays.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="searchResultLimit">Search Result Limit</Label>
              <Input
                id="searchResultLimit"
                type="number"
                min="1"
                placeholder="Leave blank for Unlimited"
                {...register('searchResultLimit')}
              />
              <p className="text-xs text-muted-foreground">Max profiles in search results (Leave empty for Unlimited).</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contactQuota">Contact Quota</Label>
              <Input
                id="contactQuota"
                type="number"
                min="0"
                placeholder="Leave blank for Unlimited (0 for None)"
                {...register('contactQuota')}
              />
              <p className="text-xs text-muted-foreground">Contact & horoscope reveals allowed (Leave empty for Unlimited).</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="photoLimit">Max Photo Uploads</Label>
              <Input
                id="photoLimit"
                type="number"
                min="1"
                defaultValue={5}
                {...register('photoLimit', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                min="0"
                defaultValue={0}
                placeholder="0, 1, 2..."
                {...register('sortOrder', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLAN_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-foreground">Plan Features & Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <SubscriptionFeatureList
              features={features}
              onChange={(nextList) => setValue('features', nextList, { shouldDirty: true })}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/subscription-plans')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-1.5">
            {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            Create Plan
          </Button>
        </div>
      </form>
    </div>
  )
}

