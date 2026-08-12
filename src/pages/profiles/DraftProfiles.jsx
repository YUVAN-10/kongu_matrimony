import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle2, CircleAlert, Pencil, Eye, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ProfileSearch from '@/components/profiles/ProfileSearch'
import { useProfiles } from '@/hooks/useProfiles'
import { calculateProfileCompletion } from '@/utils/profileCompletion'

export default function DraftProfiles() {
  const navigate = useNavigate()
  const location = useLocation()

  // Override filters to only show draft profiles
  const {
    profiles,
    loading,
    error,
    hasMore,
    page,
    pageSize,
    setPageSize,
    goToNextPage,
    goToPreviousPage,
    searchTerm,
    setSearchTerm,
    updateFilters,
    sortBy,
    setSortBy,
  } = useProfiles()

  // Set draft filter on mount - only run once when component mounts
  useEffect(() => {
    updateFilters({ status: 'draft' })
    setSortBy('lastUpdated')
  }, []) // Empty dependency array ensures this only runs once

  const successMessage = location.state?.successMessage

  function goToView(profileId) {
    navigate(`/profiles/${profileId}`)
  }
  function goToEdit(profileId) {
    navigate(`/profiles/${profileId}/edit`)
  }
  function goToUser(userId) {
    navigate(`/users/${userId}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Draft Profiles</h1>
          <p className="text-sm text-muted-foreground">Manage incomplete profile drafts.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ProfileSearch value={searchTerm} onChange={setSearchTerm} className="w-full sm:w-72" />
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
                    className="underline underline-offset-2"
                  >
                    Create the index in Firebase Console
                  </a>
                </div>
              </>
            ) : (
              <div>Couldn&apos;t load draft profiles. Please try again later.</div>
            )}
          </div>
        </div>
      )}

      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Photo</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Completion</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Last Updated</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && profiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Loading draft profiles...
                  </td>
                </tr>
              ) : profiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No draft profiles found.
                  </td>
                </tr>
              ) : (
                profiles.map((profile) => (
                  <tr key={profile.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3">
                      {profile.photos?.[0] ? (
                        <img
                          src={profile.photos[0]}
                          alt={profile.personal?.fullName || 'Profile'}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{profile.personal?.fullName || 'Unnamed'}</td>
                    <td className="px-4 py-3 w-48">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span>{calculateProfileCompletion(profile)}%</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${calculateProfileCompletion(profile)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {profile.system?.updatedAt?.toDate?.()?.toLocaleDateString() || profile.system?.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => goToEdit(profile.id)}
                          className="h-8 px-2 text-xs"
                          title="Continue Editing"
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => goToView(profile.id)}
                          className="h-8 px-2 text-xs"
                          title="View Profile"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {profile.userId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => goToUser(profile.userId)}
                            className="h-8 px-2 text-xs"
                            title="View User"
                          >
                            <User className="h-4 w-4 mr-1" />
                            User
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {(hasMore || page > 1) && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <div className="text-xs text-muted-foreground">
              Page {page}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPreviousPage}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNextPage}
                disabled={!hasMore}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}