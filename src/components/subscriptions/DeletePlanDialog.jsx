import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { getAssignedUserCount } from '@/services/subscriptionService'

/**
 * Checks live (on open) whether the plan is currently assigned to any
 * active user before allowing deletion — if so, the delete action is
 * hidden entirely and the required blocking message is shown instead.
 */
export default function DeletePlanDialog({ plan, open, onOpenChange, onConfirm }) {
  const [checking, setChecking] = useState(true)
  const [assignedCount, setAssignedCount] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!open || !plan) return
    let cancelled = false
    setChecking(true)
    setError(null)
    getAssignedUserCount(plan.id)
      .then((count) => {
        if (!cancelled) setAssignedCount(count)
      })
      .catch(() => {
        if (!cancelled) setAssignedCount(0)
      })
      .finally(() => {
        if (!cancelled) setChecking(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, plan])

  const blocked = !checking && assignedCount > 0

  async function handleConfirm() {
    setSubmitting(true)
    setError(null)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (err) {
      setError(err.message || 'Could not delete plan. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading">
            Delete {plan?.planName || 'this plan'}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {checking
              ? 'Checking whether this plan is currently in use…'
              : blocked
                ? 'This plan is currently assigned to users and cannot be deleted.'
                : 'This permanently removes the plan. This cannot be undone.'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>{blocked ? 'Close' : 'Cancel'}</AlertDialogCancel>
          {!blocked && (
            <AlertDialogAction
              variant="destructive"
              disabled={checking || submitting}
              onClick={(event) => {
                event.preventDefault()
                handleConfirm()
              }}
            >
              {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : 'Delete Plan'}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
