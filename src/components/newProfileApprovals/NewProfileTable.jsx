import { UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ProfileStatusBadge from '@/components/profiles/ProfileStatusBadge'
import { formatDate } from '@/utils/helpers'

const COLUMN_COUNT = 9

export default function NewProfileTable({ profiles, loading, page, hasMore, onNextPage, onPreviousPage, onReview }) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Photo</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">User</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">City</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Gender</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Completion</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Submitted</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && profiles.length === 0 ? (
              <tr>
                <td colSpan={COLUMN_COUNT} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Loading new profile submissions...
                </td>
              </tr>
            ) : profiles.length === 0 ? (
              <tr>
                <td colSpan={COLUMN_COUNT} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No new profiles awaiting approval.
                </td>
              </tr>
            ) : (
              profiles.map((profile) => (
                <tr key={profile.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3">
                    {profile.photos?.main?.url ? (
                      <img
                        src={profile.photos.main.url}
                        alt={profile.personal?.fullName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <UserRound className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {profile.personal?.fullName || 'Unnamed'}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-foreground">{profile.userName}</p>
                    <p className="text-xs text-muted-foreground">{profile.userPhone}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{profile.address?.city || '—'}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground capitalize">{profile.personal?.gender || '—'}</td>
                  <td className="px-4 py-3 w-40">
                    <div className="space-y-1">
                      <div className="text-xs">{profile.completion}%</div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-300"
                          style={{ width: `${profile.completion}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(profile.system?.submittedAt)}</td>
                  <td className="px-4 py-3">
                    <ProfileStatusBadge status={profile.system?.status} />
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" onClick={() => onReview(profile.id)} className="h-8 px-3 text-xs">
                      Review
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {(hasMore || page > 1) && (
        <div className="flex items-center justify-between border-t px-4 py-3">
          <div className="text-xs text-muted-foreground">Page {page}</div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onPreviousPage} disabled={page === 1}>
              Previous
            </Button>
            <Button variant="ghost" size="sm" onClick={onNextPage} disabled={!hasMore}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
