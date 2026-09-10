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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function RejectNewProfileDialog({ profile, open, onOpenChange, onConfirm }) {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (open) {
      setReason('')
      setError(null)
    }
  }, [open])

  async function handleConfirm() {
    if (!reason.trim()) {
      setError('Please provide a reason for rejecting this profile.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onConfirm(reason.trim())
      onOpenChange(false)
    } catch (err) {
      setError(err.message || 'Could not reject this profile. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading">Reject this profile?</AlertDialogTitle>
          <AlertDialogDescription>
            {profile?.personal?.fullName || 'This profile'} stays unavailable. The client will see this reason and
            can correct and resubmit the same profile.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="new-profile-rejection-reason">Rejection Reason *</Label>
          <Textarea
            id="new-profile-rejection-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="e.g. Please complete your horoscope details."
            rows={3}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={submitting}
            onClick={(event) => {
              event.preventDefault()
              handleConfirm()
            }}
          >
            {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : 'Reject Profile'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
