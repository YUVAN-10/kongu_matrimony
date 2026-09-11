import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, CircleAlert, Download, FileSpreadsheet, Plus, RefreshCw, Ban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SearchBar from '@/components/users/SearchBar'
import UserFilters from '@/components/users/UserFilters'
import UserTable from '@/components/users/UserTable'
import BlockUserDialog from '@/components/users/BlockUserDialog'
import UserDetails from '@/pages/users/UserDetails'
import { useUsers } from '@/hooks/useUsers'
import {
  blockUser,
  unblockUser,
  exportUsersToCsv,
  exportUsersToExcel,
} from '@/services/userService'

export default function Users() {
  const navigate = useNavigate()
  const location = useLocation()
  const { userId: routeUserId } = useParams()

  const {
    users,
    loading,
    error,
    hasMore,
    totalCount,
    page,
    pageSize,
    setPageSize,
    goToNextPage,
    goToPreviousPage,
    searchTerm,
    setSearchTerm,
    filters,
    updateFilters,
    resetFilters,
    refetch,
  } = useUsers()

  const [blockTarget, setBlockTarget] = useState(null)
  const [actionNotification, setActionNotification] = useState(
    location.state?.successMessage
      ? { text: location.state.successMessage, type: 'success' }
      : null
  )

  function openDetails(userId) {
    navigate(`/users/${userId}`)
  }

  function closeDetails() {
    navigate('/users')
  }

  async function handleBlockConfirm() {
    if (!blockTarget) return
    try {
      await blockUser(blockTarget.id)
      setActionNotification({
        text: `User "${blockTarget.name}" has been blocked.`,
        type: 'destructive',
      })
      refetch()
    } catch (err) {
      console.error('Failed to block user:', err)
    }
  }

  async function handleUnblock(user) {
    if (!user) return
    try {
      await unblockUser(user.id)
      setActionNotification({
        text: `User "${user.name}" has been unblocked.`,
        type: 'success',
      })
      refetch()
    } catch (err) {
      console.error('Failed to unblock user:', err)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground">Manage registered platform users and accounts.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SearchBar value={searchTerm} onChange={setSearchTerm} className="w-full sm:w-72" />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => exportUsersToCsv(users)}
            disabled={users.length === 0}
            className="gap-1.5"
          >
            <Download className="size-4" aria-hidden="true" />
            CSV
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => exportUsersToExcel(users)}
            disabled={users.length === 0}
            className="gap-1.5"
          >
            <FileSpreadsheet className="size-4" aria-hidden="true" />
            Excel
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={loading}
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button asChild size="sm" className="gap-1.5">
            <Link to="/users/add">
              <Plus className="size-4" aria-hidden="true" />
              Add User
            </Link>
          </Button>
        </div>
      </div>

      {actionNotification && (
        <div
          role="status"
          className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition-all duration-300 ${
            actionNotification.type === 'destructive'
              ? 'border-destructive/30 bg-destructive/10 text-destructive'
              : 'border-success/30 bg-success/10 text-success'
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {actionNotification.type === 'destructive' ? (
              <Ban className="size-4 shrink-0 text-destructive" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden="true" />
            )}
            <span>{actionNotification.text}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActionNotification(null)}
            className={`h-6 px-2 text-xs hover:bg-opacity-20 ${
              actionNotification.type === 'destructive'
                ? 'text-destructive hover:bg-destructive/20'
                : 'text-success hover:bg-success/20'
            }`}
          >
            Dismiss
          </Button>
        </div>
      )}

      <UserFilters filters={filters} onChange={updateFilters} onReset={resetFilters} />

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <p className="font-medium">Couldn&apos;t load users</p>
            <p className="text-xs">{error}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={refetch} className="h-7 text-xs text-destructive hover:bg-destructive/20">
            Retry
          </Button>
        </div>
      )}

      <UserTable
        users={users}
        loading={loading}
        page={page}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        hasMore={hasMore}
        totalCount={totalCount}
        onNextPage={goToNextPage}
        onPreviousPage={goToPreviousPage}
        onView={openDetails}
        onEdit={(userId) => navigate(`/users/${userId}/edit`)}
        onBlock={setBlockTarget}
        onUnblock={handleUnblock}
      />

      <UserDetails
        userId={routeUserId}
        open={Boolean(routeUserId)}
        onOpenChange={(open) => !open && closeDetails()}
        onStatusChange={refetch}
      />

      <BlockUserDialog
        user={blockTarget}
        open={Boolean(blockTarget)}
        onOpenChange={(open) => !open && setBlockTarget(null)}
        onConfirm={handleBlockConfirm}
      />
    </div>
  )
}