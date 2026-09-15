import { useState } from 'react'
import { CheckCircle2, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { COMMON_PLAN_FEATURES } from '@/constants/subscriptionOptions'

/**
 * Feature manager component supporting both string array editing (with custom input + presets)
 * and read-only checklist display.
 */
export default function SubscriptionFeatureList({ features = [], onChange, readOnly = false }) {
  const [newFeatureText, setNewFeatureText] = useState('')

  const featureList = Array.isArray(features)
    ? features
    : features && typeof features === 'object'
      ? Object.entries(features)
          .filter(([, v]) => Boolean(v))
          .map(([k]) => k)
      : []

  if (readOnly) {
    if (featureList.length === 0) {
      return <p className="text-sm text-muted-foreground">No features specified for this plan.</p>
    }

    return (
      <ul className="space-y-2">
        {featureList.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-2 text-sm text-foreground">
            <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden="true" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    )
  }

  function handleAddFeature(text) {
    const trimmed = text?.trim()
    if (!trimmed) return
    if (!featureList.includes(trimmed)) {
      const next = [...featureList, trimmed]
      onChange?.(next)
    }
    setNewFeatureText('')
  }

  function handleRemoveFeature(indexToRemove) {
    const next = featureList.filter((_, idx) => idx !== indexToRemove)
    onChange?.(next)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddFeature(newFeatureText)
    }
  }

  return (
    <div className="space-y-4">
      {/* Current Active Features */}
      {featureList.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {featureList.map((feature, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="flex items-center gap-1.5 py-1 px-2.5 text-sm font-normal bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <span>{feature}</span>
              <button
                type="button"
                onClick={() => handleRemoveFeature(idx)}
                className="hover:text-destructive transition-colors focus:outline-none"
                aria-label={`Remove feature ${feature}`}
              >
                <X className="size-3.5" />
              </button>
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No features added yet. Add custom features or pick from suggestions below.</p>
      )}

      {/* Input to Add Custom Feature */}
      <div className="flex gap-2">
        <Input
          value={newFeatureText}
          onChange={(e) => setNewFeatureText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a feature (e.g. Unlimited Search, 100 Contacts) and press Enter"
          className="text-sm"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleAddFeature(newFeatureText)}
          disabled={!newFeatureText.trim()}
          className="gap-1 shrink-0"
        >
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      {/* Common Suggestions */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground">Popular Suggestions (Click to add):</p>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_PLAN_FEATURES.map((suggestion) => {
            const isSelected = featureList.includes(suggestion)
            return (
              <button
                key={suggestion}
                type="button"
                disabled={isSelected}
                onClick={() => handleAddFeature(suggestion)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                  isSelected
                    ? 'bg-muted/50 text-muted-foreground/60 border-transparent cursor-not-allowed'
                    : 'bg-background hover:bg-primary/10 hover:text-primary border-border/80 text-foreground'
                }`}
              >
                + {suggestion}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

