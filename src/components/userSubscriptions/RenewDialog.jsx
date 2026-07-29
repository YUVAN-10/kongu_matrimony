import { useState } from 'react'
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

/**
 * Quick one-click "renew with the same plan" action, offered directly from
 * the table/action menu and the Expired badge. For a different plan or a
 * custom day-count extension, RenewSubscription.jsx (the full page) is
 * where that happens — this dialog intentionally only covers the fast path.
 */
export default function RenewDialog({ subscription, open, onOpenChange, onConfirm }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function handleConfirm() {
    setSubmitting(true)
    setError(null)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (err) {
      setError(err.message || 'Could not renew subscription. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading">
            Renew {subscription?.planName || 'this subscription'}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Renews with the same plan starting today, recalculating a fresh expiry date. To
            switch to a different plan or add a custom number of days instead, use Renew / Extend
            from the subscription&apos;s details page.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={submitting}
            onClick={(event) => {
              event.preventDefault()
              handleConfirm()
            }}
          >
            {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : 'Renew'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
