import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PROFILE_STEPS } from '@/constants/profileOptions'

/**
 * Presentational stepper shell — it knows nothing about drafts, publishing,
 * or validation. The parent (ProfileForm.jsx) decides what the footer
 * action buttons do via `primaryActions`, since that differs between
 * creating/continuing a draft (Save as Draft + Publish) and editing an
 * already-active profile (just Save Changes).
 *
 * Step indicators are clickable at any time — only Step 1's three fields
 * are ever mandatory, so free jumping between steps is always safe and
 * doubles as a shortcut straight to Review & Submit.
 */
export default function ProfileFormStepper({
  currentStep,
  onStepClick,
  onBack,
  onNext,
  isLastStep,
  primaryActions = [],
  children,
}) {
  return (
    <div className="space-y-6">
      <nav aria-label="Profile form steps" className="hidden overflow-x-auto pb-2 sm:block">
        <ol className="flex min-w-max items-center gap-1">
          {PROFILE_STEPS.map((step, index) => {
            const isActive = index === currentStep
            const isDone = index < currentStep
            return (
              <li key={step.key} className="flex items-center">
                <button
                  type="button"
                  onClick={() => onStepClick(index)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors',
                    isActive && 'bg-primary text-primary-foreground',
                    !isActive && isDone && 'bg-primary/10 text-primary hover:bg-primary/20',
                    !isActive && !isDone && 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  <span
                    className={cn(
                      'flex size-4 items-center justify-center rounded-full text-[10px]',
                      isActive && 'bg-primary-foreground text-primary',
                      !isActive && isDone && 'bg-primary text-primary-foreground',
                      !isActive && !isDone && 'bg-muted-foreground/20'
                    )}
                  >
                    {isDone ? <Check className="size-2.5" aria-hidden="true" /> : index + 1}
                  </span>
                  {step.title}
                </button>
                {index < PROFILE_STEPS.length - 1 && (
                  <span className="mx-1 h-px w-3 bg-border" aria-hidden="true" />
                )}
              </li>
            )
          })}
        </ol>
      </nav>

      <div className="sm:hidden">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Step {currentStep + 1} of {PROFILE_STEPS.length}
          </span>
          <span className="font-medium text-foreground">{PROFILE_STEPS[currentStep].title}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${((currentStep + 1) / PROFILE_STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <div>{children}</div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
        <Button type="button" variant="outline" onClick={onBack} disabled={currentStep === 0}>
          Back
        </Button>

        <div className="flex flex-wrap gap-2">
          {primaryActions.map((action) => (
            <Button
              key={action.label}
              type="button"
              variant={action.variant || 'default'}
              onClick={action.onClick}
              disabled={action.loading}
            >
              {action.loading ? `${action.label}…` : action.label}
            </Button>
          ))}
          {!isLastStep && (
            <Button type="button" onClick={onNext}>
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
