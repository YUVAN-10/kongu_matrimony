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

// Confirms the "Save as Draft" action — the core of this admin panel's
// paper-to-digital registration workflow, so it gets its own explicit
// confirmation moment rather than saving silently.
export default function DraftConfirmationDialog({ open, onOpenChange, onConfirm }) {
  const [submitting, setSubmitting] = useState(false)

  async function handleConfirm() {
    setSubmitting(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading">Save as Draft?</AlertDialogTitle>
          <AlertDialogDescription>
            This profile will be saved with only the information entered so far — incomplete
            fields are fine. It stays hidden from the client application until you Publish it, and
            you can continue editing anytime from the Profiles list.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={submitting}
            onClick={(event) => {
              event.preventDefault()
              handleConfirm()
            }}
          >
            {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : 'Save as Draft'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
