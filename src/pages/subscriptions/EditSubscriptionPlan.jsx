import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { CircleAlert, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import SubscriptionFeatureList from '@/components/subscriptions/SubscriptionFeatureList'
import { useAuth } from '@/hooks/useAuth'
import { getSubscriptionPlanById, updateSubscriptionPlan } from '@/services/subscriptionService'
import { PLAN_STATUS_OPTIONS } from '@/constants/subscriptionOptions'

// Plan Name is read-only here by design — only Price, Duration, Description,
// Features, and Status are editable, matching the module spec exactly.
export default function EditSubscriptionPlan() {
  const { planId } = useParams()
  const navigate = useNavigate()
  const { currentAdmin } = useAuth()

  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [submitError, setSubmitError] = useState(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { price: '', durationDays: '', description: '', status: 'active', features: {} },
  })

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getSubscriptionPlanById(planId)
      .then((data) => {
        if (cancelled) return
        if (!data) {
          setLoadError('Plan not found.')
        } else {
          setPlan(data)
          reset({
            price: data.price,
            durationDays: data.durationDays,
            description: data.description || '',
            status: data.status || 'active',
            features: data.features || {},
          })
        }
      })
      .catch((error) => {
        if (!cancelled) setLoadError(error.message || 'Could not load plan.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [planId, reset])

  const features = watch('features')

  async function onSubmit(data) {
    setSubmitError(null)
    try {
      await updateSubscriptionPlan(planId, data, { admin: currentAdmin })
      navigate('/subscription-plans', { state: { successMessage: 'Plan updated successfully.' } })
    } catch (error) {
      setSubmitError(error.message || 'Could not update plan. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div
        role="alert"
        className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
      >
        <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>{loadError}</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Edit Subscription Plan</h1>
        <p className="text-sm text-muted-foreground">{plan.planName}</p>
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
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="planName">Plan Name</Label>
              <Input id="planName" value={plan.planName} disabled />
              <p className="text-xs text-muted-foreground">
                Plan Name can&apos;t be changed after creation.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register('price', {
                  required: 'Price is required.',
                  valueAsNumber: true,
                  min: { value: 0.01, message: 'Price must be greater than 0.' },
                })}
              />
              {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="durationDays">Duration (Days) *</Label>
              <Input
                id="durationDays"
                type="number"
                {...register('durationDays', {
                  required: 'Duration is required.',
                  valueAsNumber: true,
                  min: { value: 1, message: 'Duration must be greater than 0.' },
                })}
              />
              {errors.durationDays && (
                <p className="text-xs text-destructive">{errors.durationDays.message}</p>
              )}
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

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={3} {...register('description')} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-foreground">Features</CardTitle>
          </CardHeader>
          <CardContent>
            <SubscriptionFeatureList
              features={features}
              onChange={(key, checked) => setValue(`features.${key}`, checked, { shouldDirty: true })}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/subscription-plans')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-1.5">
            {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
