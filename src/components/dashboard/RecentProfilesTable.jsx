import { User, Users } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/common/EmptyState'
import { formatDate } from '@/utils/helpers'
import { cn } from '@/lib/utils'

const STATUS_STYLES = {
  draft: 'bg-secondary/20 text-secondary-foreground',
  active: 'bg-success/10 text-success',
  hidden: 'bg-orange-500/10 text-orange-600',
  deleted: 'bg-destructive/10 text-destructive',
}

export default function RecentProfilesTable({ profiles, loading }) {
  return (
    <Card className="animate-in fade-in border-border/70 shadow-sm duration-500">
      <CardHeader>
        <CardTitle className="font-heading text-lg text-foreground">Recent Profiles</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase">
              <th className="px-5 py-3 font-medium">Photo</th>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Gender</th>
              <th className="px-5 py-3 font-medium">City</th>
              <th className="px-5 py-3 font-medium">Created By</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-3" colSpan={7}>
                    <Skeleton className="h-8 w-full" />
                  </td>
                </tr>
              ))
            ) : profiles.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-6">
                  <EmptyState
                    icon={Users}
                    title="No profiles yet"
                    description="Profiles will appear here once users start registering."
                  />
                </td>
              </tr>
            ) : (
              profiles.map((profile) => (
                <tr
                  key={profile.id}
                  className="border-b border-border/60 last:border-0 hover:bg-muted/40"
                >
                  <td className="px-5 py-3">
                    <div className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-muted">
                      {profile.photos?.main?.url ? (
                        <img
                          src={profile.photos.main.url}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        <User className="size-4 text-muted-foreground" aria-hidden="true" />
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 font-medium text-foreground">
                    {profile.personal?.fullName || '—'}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground capitalize">
                    {profile.personal?.gender || '—'}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{profile.address?.city || '—'}</td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {profile.system?.createdBy || '—'}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {formatDate(profile.system?.createdAt)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                        STATUS_STYLES[profile.system?.status] || 'bg-muted text-muted-foreground'
                      )}
                    >
                      {profile.system?.status || 'unknown'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
