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

export default function ApprovalDialog({ request, open, onOpenChange, onConfirm }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function handleConfirm() {
    setSubmitting(true)
    setError(null)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (err) {
      setError(err.message || 'Could not approve these changes. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading">Approve these profile changes?</AlertDialogTitle>
          <AlertDialogDescription>
            {request?.changeCount || 0} change(s) will be applied to the live profile
            {request?.profileName ? ` for "${request.profileName}"` : ''} immediately, and this request
            will be marked Approved. This cannot be undone.
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
            {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : 'Approve Changes'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
