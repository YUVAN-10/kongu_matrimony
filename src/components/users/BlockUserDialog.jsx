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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const REASONS = ['Spam', 'Fake Profile', 'Duplicate', 'Abuse', 'Other']

export default function BlockUserDialog({ user, open, onOpenChange, onConfirm }) {
  const [reason, setReason] = useState('Spam')
  const [otherDetail, setOtherDetail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setReason('Spam')
      setOtherDetail('')
    }
  }, [open])

  async function handleConfirm() {
    const finalReason = reason === 'Other' && otherDetail.trim() ? `Other: ${otherDetail.trim()}` : reason
    setSubmitting(true)
    try {
      await onConfirm(finalReason)
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading">
            Block {user?.name || 'this user'}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            They will immediately lose access until an admin unblocks them. Choose a reason for
            the record.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <RadioGroup value={reason} onValueChange={setReason}>
          {REASONS.map((option) => (
            <div key={option} className="flex items-center gap-2">
              <RadioGroupItem value={option} id={`block-reason-${option}`} />
              <Label htmlFor={`block-reason-${option}`} className="font-normal">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>

        {reason === 'Other' && (
          <Textarea
            value={otherDetail}
            onChange={(event) => setOtherDetail(event.target.value)}
            placeholder="Describe the reason…"
            aria-label="Other block reason"
          />
        )}

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
            {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : 'Block User'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
