import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, CircleAlert, Download, FileSpreadsheet, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SearchBar from '@/components/users/SearchBar'
import UserFilters from '@/components/users/UserFilters'
import UserTable from '@/components/users/UserTable'
import BlockUserDialog from '@/components/users/BlockUserDialog'
import UserDetails from '@/pages/users/UserDetails'
import { useUsers } from '@/hooks/useUsers'
import { useAuth } from '@/hooks/useAuth'
import {
  blockUser,
  unblockUser,
  exportUsersToCsv,
  exportUsersToExcel,
} from '@/services/userService'

export default function Users() {
  const { currentAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { userId: routeUserId } = useParams()

  const {
    users,
    loading,
    error,
    hasMore,
    totalCount,
    isSearching,
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
    sortBy,
    setSortBy,
  } = useUsers()

  const [blockTarget, setBlockTarget] = useState(null)
  const successMessage = location.state?.successMessage

  function openDetails(userId) {
    navigate(`/users/${userId}`)
  }

  function closeDetails() {
    navigate('/users')
  }

  async function handleBlockConfirm(reason) {
    await blockUser(blockTarget.id, { reason, admin: currentAdmin })
  }

  async function handleUnblock(user) {
    await unblockUser(user.id, { admin: currentAdmin })
  }



  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground">Manage registered platform users.</p>
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
          <Button asChild size="sm" className="gap-1.5">
            <Link to="/users/add">
              <Plus className="size-4" aria-hidden="true" />
              Add User
            </Link>
          </Button>
        </div>
      </div>

      {successMessage && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-lg border border-success/20 bg-success/10 px-4 py-3 text-sm text-success"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{successMessage}</span>
        </div>
      )}

      <UserFilters filters={filters} onChange={updateFilters} onReset={resetFilters} />

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div>
            {error?.indexUrl ? (
              <>
                <div>Couldn&apos;t load users due to a missing Firestore index.</div>
                <div className="mt-1">
                  <a
                    href={error.indexUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Create the required index in Firebase Console
                  </a>
                </div>
              </>
            ) : (
              <span>Couldn&apos;t load users. Check your connection and try again.</span>
            )}
          </div>
        </div>
      )}

      <UserTable
        users={users}
        loading={loading}
        sortBy={sortBy}
        onSortChange={setSortBy}
        page={page}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        hasMore={hasMore}
        totalCount={totalCount}
        isSearching={isSearching}
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