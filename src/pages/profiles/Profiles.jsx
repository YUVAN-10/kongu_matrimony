import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle2, CircleAlert, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ProfileSearch from '@/components/profiles/ProfileSearch'
import ProfileFilters from '@/components/profiles/ProfileFilters'
import ProfileTable from '@/components/profiles/ProfileTable'
import ProfileCard from '@/components/profiles/ProfileCard'
import { useProfiles } from '@/hooks/useProfiles'
import { useAuth } from '@/hooks/useAuth'
import { hideProfile, restoreProfile } from '@/services/profileService'

export default function Profiles() {
  const { currentAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const {
    profiles,
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
  } = useProfiles()


  const successMessage = location.state?.successMessage

  function goToView(profileId) {
    navigate(`/profiles/${profileId}`)
  }
  function goToEdit(profileId) {
    navigate(`/profiles/${profileId}/edit`)
  }

  async function handleHide(profile) {
    await hideProfile(profile.id, { admin: currentAdmin })
  }
  async function handleRestore(profile) {
    await restoreProfile(profile.id, { admin: currentAdmin })
  }


  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Profiles</h1>
          <p className="text-sm text-muted-foreground">Manage matrimony profiles and drafts.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ProfileSearch value={searchTerm} onChange={setSearchTerm} className="w-full sm:w-72" />
          <Button asChild className="gap-1.5">
            <Link to="/profiles/add">
              <Plus className="size-4" aria-hidden="true" />
              Add Profile
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

      <ProfileFilters filters={filters} onChange={updateFilters} onReset={resetFilters} />

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div>
            {error?.indexUrl ? (
              <>
                <div>Couldn&apos;t load profiles due to a missing Firestore index.</div>
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
              <span>Couldn&apos;t load profiles. Check your connection and try again.</span>
            )}
          </div>
        </div>
      )}

      <ProfileTable
        profiles={profiles}
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
        onView={goToView}
        onEdit={goToEdit}
        onPublish={(profile) => goToEdit(profile.id)}
        onHide={handleHide}
        onRestore={handleRestore}
      />

      <ProfileCard
        profiles={profiles}
        loading={loading}
        page={page}
        hasMore={hasMore}
        onNextPage={goToNextPage}
        onPreviousPage={goToPreviousPage}
        onView={goToView}
        onEdit={goToEdit}
        onPublish={(profile) => goToEdit(profile.id)}
        onHide={handleHide}
        onRestore={handleRestore}
      />


    </div>
  )
}