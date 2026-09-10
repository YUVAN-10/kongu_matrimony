import { User as UserIcon } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import UserStatusBadge from '@/components/users/UserStatusBadge'
import UserActionMenu from '@/components/users/UserActionMenu'
import LoadingUsers from '@/components/users/LoadingUsers'
import EmptyUsers from '@/components/users/EmptyUsers'
import { formatDate } from '@/utils/helpers'
import { cn } from '@/lib/utils'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'name_asc', label: 'Name A-Z' },
  { value: 'name_desc', label: 'Name Z-A' },
]

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

const COLUMN_COUNT = 10

export default function UserTable({
  users,
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
  onBlock,
  onUnblock,
}) {
  const rangeStart = users.length === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = (page - 1) * pageSize + users.length

  return (
    <Card className="animate-in fade-in border-border/70 shadow-sm duration-500">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="font-heading text-lg text-foreground">All Users</CardTitle>
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
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Gender</th>
              <th className="px-4 py-3 font-medium">City</th>
              <th className="px-4 py-3 font-medium">Subscription</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created Date</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <LoadingUsers rows={pageSize > 10 ? 10 : pageSize} columns={COLUMN_COUNT} />
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={COLUMN_COUNT} className="px-4 py-6">
                  <EmptyUsers />
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className={cn(
                    'border-b border-border/60 last:border-0 hover:bg-muted/40',
                    user.status === 'blocked' && 'bg-destructive/5'
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-muted">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="" className="size-full object-cover" />
                      ) : (
                        <UserIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{user.name || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.phone || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">
                    {user.gender || '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{user.city || '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                        user.isPremium
                          ? 'bg-secondary/20 text-secondary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {user.isPremium ? 'Premium' : 'Free'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <UserStatusBadge status={user.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    <UserActionMenu
                      user={user}
                      onView={onView}
                      onEdit={onEdit}
                      onBlock={onBlock}
                      onUnblock={onUnblock}
                    />
                  </td>
                </tr>
              ))
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
            {users.length === 0
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