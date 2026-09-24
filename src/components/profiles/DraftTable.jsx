import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileEdit,
  Send,
  Trash2,
  UserRound,
  Loader2,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { formatDate } from '@/utils/helpers'

function formatTime(isoString) {
  if (!isoString) return '—'
  try {
    const d = new Date(isoString)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return '—'
  }
}

export default function DraftTable({
  drafts = [],
  loading = false,
  onPublishDraft,
  onDeleteDraft,
  onViewUsers,
}) {
  const navigate = useNavigate()
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [publishTarget, setPublishTarget] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setActionLoading(true)
    try {
      await onDeleteDraft(deleteTarget.userId)
      setDeleteTarget(null)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleConfirmPublish() {
    if (!publishTarget) return
    setActionLoading(true)
    try {
      await onPublishDraft(publishTarget)
      setPublishTarget(null)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-primary mb-2" />
        <span className="text-sm">Loading saved drafts...</span>
      </div>
    )
  }

  if (drafts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-xl bg-card/50 p-8">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
          <FileEdit className="size-7" />
        </div>
        <h3 className="font-heading text-lg font-semibold text-foreground">No Saved Drafts</h3>
        <p className="text-sm text-muted-foreground max-w-md mt-1">
          When you edit a profile and click "Save as Draft", the draft will appear here so you can continue editing or submit it for approval.
        </p>
        <Button onClick={() => (onViewUsers ? onViewUsers() : navigate('/users'))} className="mt-4 gap-2">
          View Active Users
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-4 py-3.5">Photo</th>
                <th scope="col" className="px-4 py-3.5">Profile Name</th>
                <th scope="col" className="px-4 py-3.5">Profile ID</th>
                <th scope="col" className="px-4 py-3.5">Updated Date</th>
                <th scope="col" className="px-4 py-3.5">Updated Time</th>
                <th scope="col" className="px-4 py-3.5">Status</th>
                <th scope="col" className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {drafts.map((draft) => {
                const name =
                  draft.profileName ||
                  draft.profileData?.personal?.fullName ||
                  'Unnamed Profile'
                const photo =
                  draft.photo ||
                  draft.profileData?.photos?.main?.url ||
                  draft.profileData?.profileImageUrl ||
                  null
                const city = draft.city || draft.profileData?.address?.city || ''
                const updatedDate = formatDate(draft.updatedAt || draft.createdAt)
                const updatedTime = formatTime(draft.updatedAt || draft.createdAt)

                return (
                  <tr key={draft.userId} className="hover:bg-muted/30 transition-colors">
                    {/* Photo */}
                    <td className="px-4 py-3">
                      <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
                        {photo ? (
                          <img src={photo} alt={name} className="size-full object-cover" />
                        ) : (
                          <UserRound className="size-5 text-muted-foreground" />
                        )}
                      </div>
                    </td>

                    {/* Profile Name & City */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">{name}</div>
                      {city && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="size-3" />
                          <span>{city}</span>
                        </div>
                      )}
                    </td>

                    {/* Profile ID */}
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {draft.userId}
                    </td>

                    {/* Updated Date */}
                    <td className="px-4 py-3 text-xs text-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-muted-foreground" />
                        <span>{updatedDate}</span>
                      </div>
                    </td>

                    {/* Updated Time */}
                    <td className="px-4 py-3 text-xs text-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="size-3.5 text-muted-foreground" />
                        <span>{updatedTime}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-400 border border-blue-500/30">
                        <span className="size-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                        Draft
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/users/${draft.userId}/edit`)}
                          className="h-8 gap-1 text-xs font-medium"
                          title="Continue editing draft"
                        >
                          <FileEdit className="size-3.5" />
                          Edit Draft
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => setPublishTarget(draft)}
                          className="h-8 gap-1 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                          title="Publish for Super Admin approval"
                        >
                          <Send className="size-3.5" />
                          Publish
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteTarget(draft)}
                          className="h-8 size-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          title="Delete draft"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              Delete Saved Draft?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the saved draft for{' '}
              <strong>{deleteTarget?.profileName || deleteTarget?.userId}</strong>? All unsaved draft changes will be discarded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={actionLoading}
              onClick={(e) => {
                e.preventDefault()
                handleConfirmDelete()
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading ? 'Deleting...' : 'Delete Draft'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Publish Confirmation Alert Dialog */}
      <AlertDialog open={!!publishTarget} onOpenChange={(open) => !open && setPublishTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-primary">
              <Send className="size-5" />
              Publish Profile Draft?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Publishing this draft for <strong>{publishTarget?.profileName || publishTarget?.userId}</strong> will immediately update the live customer profile with all saved edits.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={actionLoading}
              onClick={(e) => {
                e.preventDefault()
                handleConfirmPublish()
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
            >
              {actionLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              Publish Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
