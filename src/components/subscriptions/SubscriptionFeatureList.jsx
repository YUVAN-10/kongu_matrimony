import { CheckCircle2 } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { SUBSCRIPTION_FEATURES } from '@/constants/subscriptionOptions'

/**
 * Reusable feature selector — the same SUBSCRIPTION_FEATURES list drives
 * both the editable checkbox grid (Add/Edit forms) and the green-check
 * read-only display (View page, cards). `readOnly` switches between them;
 * in read-only mode, only enabled features are shown at all.
 */
export default function SubscriptionFeatureList({ features, onChange, readOnly = false }) {
  if (readOnly) {
    const enabled = SUBSCRIPTION_FEATURES.filter((feature) => Boolean(features?.[feature.key]))

    if (enabled.length === 0) {
      return <p className="text-sm text-muted-foreground">No features included.</p>
    }

    return (
      <ul className="space-y-2">
        {enabled.map((feature) => (
          <li key={feature.key} className="flex items-center gap-2 text-sm text-foreground">
            <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden="true" />
            {feature.label}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {SUBSCRIPTION_FEATURES.map((feature) => (
        <label
          key={feature.key}
          className="flex items-center gap-2 rounded-lg border border-border/70 px-3 py-2 text-sm transition-colors hover:bg-muted/40"
        >
          <Checkbox
            checked={Boolean(features?.[feature.key])}
            onCheckedChange={(checked) => onChange(feature.key, Boolean(checked))}
          />
          <Label className="cursor-pointer font-normal">{feature.label}</Label>
        </label>
      ))}
    </div>
  )
}
