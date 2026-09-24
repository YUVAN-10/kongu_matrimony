import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileEdit, RefreshCw, Search, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import DraftTable from '@/components/profiles/DraftTable'
import {
  getProfileDrafts,
  deleteProfileDraft,
  publishProfileDraft,
} from '@/services/profileDraftService'
import { useAuth } from '@/hooks/useAuth'

export default function SavedDrafts() {
  const navigate = useNavigate()
  const { currentAdmin } = useAuth()
  const [drafts, setDrafts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [feedback, setFeedback] = useState(null)

  async function loadDrafts(isRefresh = false) {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const data = await getProfileDrafts({ search })
      setDrafts(data || [])
    } catch {
      setDrafts([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadDrafts()
  }, [search])

  async function handleDeleteDraft(userId) {
    await deleteProfileDraft(userId, { admin: currentAdmin })
    setFeedback({ type: 'success', message: 'Draft deleted successfully.' })
    await loadDrafts()
  }

  async function handlePublishDraft(draft) {
    try {
      await publishProfileDraft(draft.userId, draft.profileData, {
        admin: currentAdmin,
        liveProfile: null,
      })
      navigate('/profiles/change-approvals', {
        state: {
          successMessage: `Profile draft for "${draft.profileName || 'User'}" submitted for approval!`,
        },
      })
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Could not submit draft for approval.',
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Saved Profile Drafts
          </h1>
          <p className="text-sm text-muted-foreground">
            View and manage work-in-progress profile drafts. Submit drafts for Super Admin approval when ready.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadDrafts(true)}
            disabled={refreshing}
            className="gap-1.5"
          >
            <RefreshCw className={`size-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => navigate('/users')} className="gap-1.5">
            <Plus className="size-4" />
            Edit a User
          </Button>
        </div>
      </div>

      {feedback && (
        <div
          role="alert"
          className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm ${
            feedback.type === 'success'
              ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
              : 'border border-destructive/20 bg-destructive/10 text-destructive'
          }`}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold underline ml-4 hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Content Card */}
      <Card className="border-border/70 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 font-heading text-lg">
                <FileEdit className="size-5 text-blue-600" />
                All Drafts ({drafts.length})
              </CardTitle>
              <CardDescription>
                Drafts are only visible to admins until published and approved.
              </CardDescription>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search drafts by name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <DraftTable
            drafts={drafts}
            loading={loading}
            onPublishDraft={handlePublishDraft}
            onDeleteDraft={handleDeleteDraft}
          />
        </CardContent>
      </Card>
    </div>
  )
}
