import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CircleAlert, Download, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SearchBar from '@/components/users/SearchBar'
import UserFilters from '@/components/users/UserFilters'
import UserTable from '@/components/users/UserTable'
import BlockUserDialog from '@/components/users/BlockUserDialog'
import DeleteUserDialog from '@/components/users/DeleteUserDialog'
import UserDetails from '@/pages/users/UserDetails'
import { useUsers } from '@/hooks/useUsers'
import { useAuth } from '@/hooks/useAuth'
import {
  blockUser,
  unblockUser,
  softDeleteUser,
  exportUsersToCsv,
  exportUsersToExcel,
} from '@/services/userService'

export default function Users() {
  const { currentAdmin } = useAuth()
  const navigate = useNavigate()
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
  const [deleteTarget, setDeleteTarget] = useState(null)

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

  async function handleDeleteConfirm() {
    await softDeleteUser(deleteTarget.id, { admin: currentAdmin })
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
        </div>
      </div>

      <UserFilters filters={filters} onChange={updateFilters} onReset={resetFilters} />

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>Couldn&apos;t load users. Check your connection and try again.</span>
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
        onEdit={openDetails}
        onBlock={setBlockTarget}
        onUnblock={handleUnblock}
        onDelete={setDeleteTarget}
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

      <DeleteUserDialog
        user={deleteTarget}
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
