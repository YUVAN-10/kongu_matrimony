import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleAlert, Loader2, Search, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useFirestoreCollection } from '@/hooks/useFirestoreCollection'
import { useAuth } from '@/hooks/useAuth'
import { searchUsersOnce } from '@/services/userService'
import { searchProfilesOnce } from '@/services/profileService'
import { assignSubscription } from '@/services/userSubscriptionService'
import { formatCurrency, formatDate } from '@/utils/helpers'

function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function PersonPicker({ label, placeholder, onSearch, onSelect, selected, renderResult }) {
  const [term, setTerm] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch(event) {
    event.preventDefault()
    if (!term.trim()) return
    setSearching(true)
    try {
      setResults(await onSearch(term))
      setSearched(true)
    } finally {
      setSearching(false)
    }
  }

  if (selected) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
        {renderResult(selected)}
        <Button type="button" variant="ghost" size="sm" onClick={() => onSelect(null)}>
          Change
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input value={term} onChange={(event) => setTerm(event.target.value)} placeholder={placeholder} />
        <Button type="submit" disabled={searching} className="gap-1.5">
          {searching ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Search className="size-4" aria-hidden="true" />}
          Search
        </Button>
      </form>
      {searched && results.length === 0 && !searching && (
        <p className="text-sm text-muted-foreground">No matching {label.toLowerCase()} found.</p>
      )}
      {results.length > 0 && (
        <ul className="divide-y divide-border rounded-lg border border-border/70">
          {results.map((result) => (
            <li key={result.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
              {renderResult(result)}
              <Button type="button" size="sm" variant="outline" onClick={() => onSelect(result)}>
                Select
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function AssignSubscription() {
  const { currentAdmin } = useAuth()
  const navigate = useNavigate()

  const { data: plans } = useFirestoreCollection('subscriptionPlans')
  const activePlans = useMemo(() => plans.filter((plan) => plan.status === 'active'), [plans])

  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const selectedPlan = activePlans.find((plan) => plan.id === selectedPlanId)
  const startDate = new Date()
  const expiryDate = selectedPlan ? addDays(startDate, Number(selectedPlan.durationDays)) : null

  const userBlocked = selectedUser?.status === 'blocked'
  const userDeleted = selectedUser?.status === 'deleted'
  const profileDeleted = selectedProfile?.system?.status === 'deleted'
  const canSubmit = selectedUser && selectedProfile && selectedPlan && !userBlocked && !userDeleted && !profileDeleted

  async function handleSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      await assignSubscription({
        userId: selectedUser.id,
        profileId: selectedProfile.id,
        planId: selectedPlanId,
        admin: currentAdmin,
        startDate,
      })
      navigate('/user-subscriptions', { state: { successMessage: 'Subscription assigned successfully.' } })
    } catch (err) {
      setError(err.message || 'Could not assign subscription. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Assign Subscription</h1>
        <p className="text-sm text-muted-foreground">Search a user, select their profile, and pick an active plan.</p>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-lg text-foreground">1. Select User</CardTitle>
        </CardHeader>
        <CardContent>
          <PersonPicker
            label="Users"
            placeholder="Search by name, phone, or email…"
            onSearch={searchUsersOnce}
            onSelect={setSelectedUser}
            selected={selectedUser}
            renderResult={(user) => (
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{user.name || '—'}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email} · {user.phone}
                  {user.status === 'blocked' && <span className="ml-2 text-destructive">Blocked</span>}
                </p>
              </div>
            )}
          />
          {userBlocked && <p className="mt-2 text-xs text-destructive">This user is blocked and cannot be assigned a subscription.</p>}
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-lg text-foreground">2. Select Profile</CardTitle>
          <CardDescription>Search for the matching matrimony profile for this user.</CardDescription>
        </CardHeader>
        <CardContent>
          <PersonPicker
            label="Profiles"
            placeholder="Search by name, phone, or profile ID…"
            onSearch={searchProfilesOnce}
            onSelect={setSelectedProfile}
            selected={selectedProfile}
            renderResult={(profile) => (
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                  {profile.photos?.main?.url ? (
                    <img src={profile.photos.main.url} alt="" className="size-full object-cover" />
                  ) : (
                    <UserRound className="size-4 text-muted-foreground" aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{profile.personal?.fullName || '—'}</p>
                  <p className="truncate text-xs text-muted-foreground capitalize">{profile.personal?.gender}</p>
                </div>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-lg text-foreground">3. Select Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5 sm:w-64">
            <Label>Subscription Plan</Label>
            <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an active plan…" />
              </SelectTrigger>
              <SelectContent>
                {activePlans.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">No active plans available.</div>
                ) : (
                  activePlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.planName} — {formatCurrency(plan.price)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedPlan && (
            <div className="grid grid-cols-1 gap-4 rounded-lg border border-border/70 bg-muted/30 p-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Price</p>
                <p className="font-medium text-foreground">{formatCurrency(selectedPlan.price)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="font-medium text-foreground">{selectedPlan.durationDays} days</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Start → Expiry</p>
                <p className="font-medium text-foreground">
                  {formatDate(startDate)} → {formatDate(expiryDate)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => navigate('/user-subscriptions')}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={!canSubmit || submitting} className="gap-1.5">
          {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          Generate Subscription
        </Button>
      </div>
    </div>
  )
}
