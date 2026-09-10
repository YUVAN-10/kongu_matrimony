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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { REJECTION_TYPE_OPTIONS } from '@/constants/changeRequestOptions'

export default function RejectionDialog({ request, open, onOpenChange, onConfirm }) {
  const [rejectionType, setRejectionType] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (open) {
      setRejectionType('')
      setReason('')
      setError(null)
    }
  }, [open])

  async function handleConfirm() {
    if (!rejectionType) {
      setError('Please select a rejection type.')
      return
    }
    if (!reason.trim()) {
      setError('Please provide a reason for rejecting these changes.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onConfirm(rejectionType, reason.trim())
      onOpenChange(false)
    } catch (err) {
      setError(err.message || 'Could not reject these changes. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading">Reject these profile changes?</AlertDialogTitle>
          <AlertDialogDescription>
            The live profile{request?.profileName ? ` for "${request.profileName}"` : ''} stays unchanged.
            The client will see this type and reason, and can submit a new request.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="rejection-type">Rejection Type *</Label>
          <Select value={rejectionType} onValueChange={setRejectionType}>
            <SelectTrigger id="rejection-type">
              <SelectValue placeholder="Select a reason type" />
            </SelectTrigger>
            <SelectContent>
              {REJECTION_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="rejection-reason">Description *</Label>
          <Textarea
            id="rejection-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Please provide a reason for rejecting these changes."
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
            {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : 'Reject Changes'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
