import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleAlert, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import ChangeRequestFilters from '@/components/profileApprovals/ChangeRequestFilters'
import ChangeRequestTable from '@/components/profileApprovals/ChangeRequestTable'
import { useProfileChangeRequests } from '@/hooks/useProfileChangeRequests'

// Same debounced-search pattern as ProfileSearch.jsx, inlined since the
// placeholder text (profile name / user name / phone) is specific to this page.
function ChangeRequestSearch({ value, onChange }) {
  const [localValue, setLocalValue] = useState(value)
  const onChangeRef = useRef(onChange)
  const valueRef = useRef(value)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    valueRef.current = value
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (localValue !== valueRef.current) onChangeRef.current(localValue)
    }, 300)
    return () => clearTimeout(timeout)
  }, [localValue])

  return (
    <div className="relative w-full sm:w-80">
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        value={localValue}
        onChange={(event) => setLocalValue(event.target.value)}
        placeholder="Search by profile name, user name, or phone…"
        className="pl-9"
        aria-label="Search profile change requests"
      />
    </div>
  )
}

export default function ProfileChangeApprovals() {
  const navigate = useNavigate()
  const {
    requests,
    totalCount,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filters,
    updateFilters,
    resetFilters,
    page,
    hasMore,
    goToNextPage,
    goToPreviousPage,
  } = useProfileChangeRequests()

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Profile Change Approvals</h1>
          <p className="text-sm text-muted-foreground">
            Review profile changes submitted by clients before they go live.
          </p>
        </div>

        <ChangeRequestSearch value={searchTerm} onChange={setSearchTerm} />
      </div>

      <ChangeRequestFilters filters={filters} onChange={updateFilters} onReset={resetFilters} />

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{typeof error === 'string' ? error : error?.message || "Couldn't load change requests."}</span>
        </div>
      )}

      {!loading && totalCount > 0 && (
        <p className="text-xs text-muted-foreground">Showing {requests.length} of {totalCount} requests.</p>
      )}

      <ChangeRequestTable
        requests={requests}
        loading={loading}
        page={page}
        hasMore={hasMore}
        onNextPage={goToNextPage}
        onPreviousPage={goToPreviousPage}
        onReview={(request) => {
          const id = typeof request === 'object' ? request.id : request
          navigate(`/profiles/change-approvals/${id}`, { state: { request } })
        }}
      />
    </div>
  )
}
