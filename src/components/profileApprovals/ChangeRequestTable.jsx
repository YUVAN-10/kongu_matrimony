import { UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ChangeRequestStatusBadge from '@/components/profileApprovals/ChangeRequestStatusBadge'
import { formatDate } from '@/utils/helpers'

export default function ChangeRequestTable({
  requests,
  loading,
  page,
  hasMore,
  onNextPage,
  onPreviousPage,
  onReview,
}) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Photo</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Profile</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Submitted</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground"># Changes</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && requests.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Loading change requests...
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No profile change requests found.
                </td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr key={request.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3">
                    {request.profilePhoto ? (
                      <img
                        src={request.profilePhoto}
                        alt={request.profileName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <UserRound className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-foreground">{request.profileName}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(request.submittedAt)}</td>
                  <td className="px-4 py-3 text-sm">{request.changeCount}</td>
                  <td className="px-4 py-3">
                    <ChangeRequestStatusBadge status={request.status} />
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" onClick={() => onReview(request)} className="h-8 px-3 text-xs">
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
