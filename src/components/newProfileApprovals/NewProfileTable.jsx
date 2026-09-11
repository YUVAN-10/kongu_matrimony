import { UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ProfileStatusBadge from '@/components/profiles/ProfileStatusBadge'
import { formatDate } from '@/utils/helpers'

const COLUMN_COUNT = 9

export default function NewProfileTable({ profiles, loading, page, hasMore, onNextPage, onPreviousPage, onReview }) {
  return (
    <div className="rounded-lg border border-border/70 bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground uppercase">
              <th className="px-4 py-3">Photo</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Gender</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
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
              profiles.map((profile) => {
                const photoUrl = profile.profileImageUrl || profile.photos?.main?.url || null
                const name = profile.fullName || profile.personal?.fullName || 'Unnamed'
                const user = profile.user || {}
                const userName = user.name || profile.userName || '—'
                const userContact = user.mobile || user.email || profile.userPhone || '—'
                const city = profile.city || profile.address?.city || '—'
                const gender = profile.gender || profile.personal?.gender || '—'
                const submittedDate = profile.createdAt || profile.system?.submittedAt
                const status = profile.approvalStatus || profile.system?.status || profile.status || 'PENDING'

                return (
                  <tr key={profile.id} className="border-b border-border/60 last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={name}
                          className="size-10 rounded-full object-cover border border-border"
                        />
                      ) : (
                        <div className="flex size-10 items-center justify-center rounded-full bg-muted border border-border">
                          <UserRound className="size-5 text-muted-foreground" aria-hidden="true" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {name}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{userName}</p>
                      <p className="text-xs text-muted-foreground">{userContact}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{city}</td>
                    <td className="px-4 py-3 text-muted-foreground uppercase">{gender}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(submittedDate)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        onClick={() => onReview(profile)}
                        className="h-8 px-3 text-xs"
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                )
              })
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
