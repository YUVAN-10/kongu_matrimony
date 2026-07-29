import { UserRound, Users as UsersIcon } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/common/EmptyState'
import ProfileStatusBadge from '@/components/profiles/ProfileStatusBadge'
import ProfileActionMenu from '@/components/profiles/ProfileActionMenu'
import { calculateAge, formatDate } from '@/utils/helpers'
import { cn } from '@/lib/utils'

const ROW_TINT = {
  draft: 'border-secondary/40 bg-secondary/5',
  hidden: 'border-orange-500/30 bg-orange-500/5',
  deleted: 'border-destructive/30 bg-destructive/5',
}

// Mobile equivalent of ProfileTable.jsx — a compact card per profile
// instead of a wide table that wouldn't fit small screens.
export default function ProfileCard({
  profiles,
  loading,
  page,
  hasMore,
  onNextPage,
  onPreviousPage,
  onView,
  onEdit,
  onPublish,
  onHide,
  onRestore,
  onDelete,
}) {
  return (
    <div className="animate-in fade-in space-y-3 duration-500 md:hidden">
      {loading ? (
        Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28 w-full rounded-xl" />)
      ) : profiles.length === 0 ? (
        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-6">
            <EmptyState
              icon={UsersIcon}
              title="No profiles found"
              description="Profiles will appear here once you add the first one."
            />
          </CardContent>
        </Card>
      ) : (
        profiles.map((profile) => {
          const status = profile.system?.status
          const age = calculateAge(profile.personal?.dob)
          return (
            <Card
              key={profile.id}
              className={cn('border-border/70 shadow-sm', ROW_TINT[status])}
            >
              <CardContent className="flex items-start gap-3 p-4">
                <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                  {profile.photos?.main?.url ? (
                    <img src={profile.photos.main.url} alt="" className="size-full object-cover" />
                  ) : (
                    <UserRound className="size-6 text-muted-foreground" aria-hidden="true" />
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {profile.personal?.fullName || '—'}
                      </p>
                      <p className="font-mono text-[11px] text-muted-foreground" title={profile.id}>
                        {profile.id.slice(0, 8)}…
                      </p>
                    </div>
                    <ProfileActionMenu
                      profile={profile}
                      onView={onView}
                      onEdit={onEdit}
                      onPublish={onPublish}
                      onHide={onHide}
                      onRestore={onRestore}
                      onDelete={onDelete}
                    />
                  </div>

                  <p className="text-xs text-muted-foreground capitalize">
                    {profile.personal?.gender || '—'}
                    {age != null && ` · ${age} yrs`}
                    {profile.address?.city && ` · ${profile.address.city}`}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <ProfileStatusBadge status={status} />
                    <span className="text-[11px] text-muted-foreground">
                      {formatDate(profile.system?.createdAt)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })
      )}

      {!loading && profiles.length > 0 && (
        <Card className="border-border/70 shadow-sm">
          <CardFooter className="flex items-center justify-between py-3 text-xs text-muted-foreground">
            <span>Page {page}</span>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onPreviousPage} disabled={page === 1}>
                Previous
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={onNextPage} disabled={!hasMore}>
                Next
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
