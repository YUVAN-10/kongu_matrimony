import { UserRound, Users as UsersIcon } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/common/EmptyState'
import ProfileStatusBadge from '@/components/profiles/ProfileStatusBadge'
import ProfileActionMenu from '@/components/profiles/ProfileActionMenu'
import { calculateAge, formatDate } from '@/utils/helpers'
import { cn } from '@/lib/utils'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'name_asc', label: 'Name A-Z' },
  { value: 'name_desc', label: 'Name Z-A' },
]

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]
const COLUMN_COUNT = 13

const ROW_TINT = {
  draft: 'bg-secondary/5',
  hidden: 'bg-orange-500/5',
  deleted: 'bg-destructive/5',
}

// Desktop/tablet table. See ProfileCard.jsx for the mobile equivalent —
// both are rendered by Profiles.jsx at different breakpoints.
export default function ProfileTable({
  profiles,
  loading,
  sortBy,
  onSortChange,
  page,
  pageSize,
  onPageSizeChange,
  hasMore,
  totalCount,
  isSearching,
  onNextPage,
  onPreviousPage,
  onView,
  onEdit,
  onPublish,
  onHide,
  onRestore,
  onDelete,
}) {
  const rangeStart = profiles.length === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = (page - 1) * pageSize + profiles.length

  return (
    <Card className="animate-in fade-in hidden border-border/70 shadow-sm duration-500 md:block">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="font-heading text-lg text-foreground">All Profiles</CardTitle>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase">
              <th className="px-4 py-3 font-medium">Photo</th>
              <th className="px-4 py-3 font-medium">Profile ID</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Gender</th>
              <th className="px-4 py-3 font-medium">Age</th>
              <th className="px-4 py-3 font-medium">City</th>
              <th className="px-4 py-3 font-medium">Religion</th>
              <th className="px-4 py-3 font-medium">Occupation</th>
              <th className="px-4 py-3 font-medium">Subscription</th>
              <th className="px-4 py-3 font-medium">Created By</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created Date</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: pageSize > 10 ? 10 : pageSize }).map((_, index) => (
                <tr key={index} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3" colSpan={COLUMN_COUNT}>
                    <Skeleton className="h-8 w-full" />
                  </td>
                </tr>
              ))
            ) : profiles.length === 0 ? (
              <tr>
                <td colSpan={COLUMN_COUNT} className="px-4 py-6">
                  <EmptyState
                    icon={UsersIcon}
                    title="No profiles found"
                    description="Profiles will appear here once you add the first one."
                  />
                </td>
              </tr>
            ) : (
              profiles.map((profile) => {
                const status = profile.system?.status
                const age = calculateAge(profile.personal?.dob)
                return (
                  <tr
                    key={profile.id}
                    className={cn(
                      'border-b border-border/60 last:border-0 hover:bg-muted/40',
                      ROW_TINT[status]
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-muted">
                        {profile.photos?.main?.url ? (
                          <img
                            src={profile.photos.main.url}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          <UserRound className="size-4 text-muted-foreground" aria-hidden="true" />
                        )}
                      </div>
                    </td>
                    <td
                      className="px-4 py-3 font-mono text-xs text-muted-foreground"
                      title={profile.id}
                    >
                      {profile.id.slice(0, 8)}…
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {profile.personal?.fullName || '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">
                      {profile.personal?.gender || '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{age ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {profile.address?.city || '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {profile.personal?.religion || '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {profile.occupation?.jobTitle || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          profile.system?.subscriptionStatus === 'premium'
                            ? 'bg-secondary/20 text-secondary-foreground'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {profile.system?.subscriptionStatus === 'premium' ? 'Premium' : 'Free'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {profile.system?.createdBy || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <ProfileStatusBadge status={status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(profile.system?.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <ProfileActionMenu
                        profile={profile}
                        onView={onView}
                        onEdit={onEdit}
                        onPublish={onPublish}
                        onHide={onHide}
                        onRestore={onRestore}
                        onDelete={onDelete}
                      />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Rows per page</span>
          <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            {profiles.length === 0
              ? 'No results'
              : totalCount != null
                ? `${rangeStart}–${rangeEnd} of ${totalCount}`
                : `Page ${page}${isSearching ? ' (search results)' : ''}`}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onPreviousPage}
              disabled={page === 1 || loading}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onNextPage}
              disabled={!hasMore || loading}
            >
              Next
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
