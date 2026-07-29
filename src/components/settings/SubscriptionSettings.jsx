import { useFormContext } from 'react-hook-form'
import { ShoppingCart } from 'lucide-react'
import SettingsSectionCard from '@/components/settings/SettingsSectionCard'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SubscriptionSettings() {
  const { register } = useFormContext()

  return (
    <SettingsSectionCard
      title="Subscription Settings"
      description="Define the default subscription behavior used by the application."
      icon={ShoppingCart}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="subscription-defaultFreePlanId">Default Free Plan</Label>
          <Input id="subscription-defaultFreePlanId" {...register('subscription.defaultFreePlanId')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subscription-defaultPremiumPlanId">Default Premium Plan</Label>
          <Input id="subscription-defaultPremiumPlanId" {...register('subscription.defaultPremiumPlanId')} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="subscription-defaultTrialDays">Default Trial Days</Label>
          <Input id="subscription-defaultTrialDays" type="number" min="0" {...register('subscription.defaultTrialDays', { valueAsNumber: true })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subscription-reminderBeforeExpiryDays">Reminder Before Expiry (Days)</Label>
          <Input id="subscription-reminderBeforeExpiryDays" type="number" min="0" {...register('subscription.reminderBeforeExpiryDays', { valueAsNumber: true })} />
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
        <input id="subscription-autoExpireSubscription" type="checkbox" className="h-4 w-4 rounded border-border accent-primary" {...register('subscription.autoExpireSubscription')} />
        <Label htmlFor="subscription-autoExpireSubscription" className="cursor-pointer">
          Auto expire subscriptions when the billing period ends
        </Label>
      </div>
    </SettingsSectionCard>
  )
}
