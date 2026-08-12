  import { useMemo, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CircleAlert, Loader2, Search, UserRound, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useFirestoreCollection } from '@/hooks/useFirestoreCollection'
import { useAuth } from '@/hooks/useAuth'
import { searchUsersOnce } from '@/services/userService'
import { getProfileByUserId } from '@/services/profileService'
import { assignSubscription, hasActiveSubscription } from '@/services/userSubscriptionService'
import { formatCurrency, formatDate } from '@/utils/helpers'

function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function UserSearch({ onSelect, selectedUser, onClear }) {
  const [term, setTerm] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    let mounted = true

    async function search() {
      if (!term.trim()) {
        setResults([])
        setSearched(false)
        return
      }
      setSearching(true)
      setSearched(false)
      try {
        const res = await searchUsersOnce(term)
        if (!mounted) return
        setResults(res)
        setSearched(true)
      } finally {
        if (mounted) setSearching(false)
      }
    }

    search()

    return () => {
      mounted = false
    }
  }, [term])

  async function handleSearch(event) {
    event.preventDefault()
    if (!term.trim()) return
    setSearching(true)
    try {
      setResults(await searchUsersOnce(term))
      setSearched(true)
    } finally {
      setSearching(false)
    }
  }

  if (selectedUser) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{selectedUser.name || '—'}</p>
            <p className="truncate text-xs text-muted-foreground">
              {selectedUser.email} · {selectedUser.phone}
            </p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClear}>
            Change
          </Button>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to={`/users/${selectedUser.id}`}>View User</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Search by name, phone, or email…" />
        <Button type="submit" disabled={searching} className="gap-1.5">
          {searching ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Search className="size-4" aria-hidden="true" />}
          Search
        </Button>
      </form>
      {searched && results.length === 0 && !searching && (
        <p className="text-sm text-muted-foreground">No matching users found.</p>
      )}
      {results.length > 0 && (
        <ul className="divide-y divide-border rounded-lg border border-border/70">
          {results.map((user) => (
            <li key={user.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{user.name || '—'}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email} · {user.phone}
                  {user.status === 'blocked' && <span className="ml-2 text-destructive">Blocked</span>}
                </p>
                <p className={`text-xs ${user.hasProfile ? 'text-green-600' : 'text-amber-600'}`}>
                  Profile: {user.hasProfile ? 'Available' : 'Not Available'}
                </p>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={() => onSelect(user)}>
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
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState(null)
  const [activeSubscription, setActiveSubscription] = useState(null)
  const [checkingSubscription, setCheckingSubscription] = useState(false)

  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!selectedUser) {
      setProfile(null)
      setProfileLoading(false)
      setProfileError(null)
      setActiveSubscription(null)
      setCheckingSubscription(false)
      return
    }

    async function fetchProfileAndSubscription() {
      setProfileLoading(true)
      setProfileError(null)
      setCheckingSubscription(true)
      try {
        const foundProfile = await getProfileByUserId(selectedUser.id)
        setProfile(foundProfile)

        if (foundProfile) {
          const sub = await hasActiveSubscription(selectedUser.id)
          setActiveSubscription(sub)
        }
      } catch (err) {
        setProfileError('Failed to load profile. Please try again.')
        console.error(err)
      } finally {
        setProfileLoading(false)
        setCheckingSubscription(false)
      }
    }

    fetchProfileAndSubscription()
  }, [selectedUser])

  const selectedPlan = activePlans.find((plan) => plan.id === selectedPlanId)
  const startDate = new Date()
  const expiryDate = selectedPlan ? addDays(startDate, Number(selectedPlan.durationDays)) : null

  const userBlocked = selectedUser?.status === 'blocked'
  const profileDeleted = profile?.system?.status === 'deleted'
  const profileInvalid = profile?.system?.status === 'draft' || profile?.system?.status === 'hidden'

  const canSubmit =
    selectedUser &&
    profile &&
    selectedPlan &&
    !userBlocked &&
    !profileDeleted &&
    !activeSubscription &&
    !submitting

  async function handleSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      await assignSubscription({
        userId: selectedUser.id,
        profileId: profile.id,
        planId: selectedPlanId,
        admin: currentAdmin,
        startDate,
      })
      navigate('/user-subscriptions', { state: { successMessage: 'Subscription assigned successfully.' } })
    } catch (err) {
      setError(err.message || 'Could not assign subscription. Please try again.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  function handleSelectUser(user) {
    setSelectedUser(user)
    setProfile(null)
    setSelectedPlanId('')
    setError(null)
  }

  function handleClearUser() {
    setSelectedUser(null)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Assign Subscription</h1>
        <p className="text-sm text-muted-foreground">Search for a user to automatically link their profile and assign a new plan.</p>
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
          <UserSearch onSelect={handleSelectUser} selectedUser={selectedUser} onClear={handleClearUser} />
          {userBlocked && (
            <p className="mt-3 text-sm text-destructive">This user is blocked and cannot be assigned a subscription.</p>
          )}
        </CardContent>
      </Card>

      {selectedUser && (
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-foreground">2. Linked Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {profileLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                <span>Loading profile...</span>
              </div>
            )}
            {profileError && <p className="text-destructive">{profileError}</p>}
            {!profileLoading && !profileError && profile && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                    {profile.photos?.main?.url ? (
                      <img src={profile.photos.main.url} alt="" className="size-full object-cover" />
                    ) : (
                      <UserRound className="size-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{profile.personal?.fullName}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {profile.personal?.gender}, {profile.personal?.age} · {profile.address?.city}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Profile ID:</span> {profile.id}
                  </p>
                  <p className="text-sm capitalize">
                    <span className="text-muted-foreground">Status:</span> {profile.system?.status}
                  </p>
                </div>
                {profileInvalid && (
                  <p className="text-sm text-amber-600">This profile is not currently active. Proceed with caution.</p>
                )}
                {profileDeleted && (
                  <p className="text-sm text-destructive">This profile has been deleted and cannot receive a subscription.</p>
                )}
                <Button asChild variant="outline" size="sm">
                  <Link to={`/profiles/${profile.id}`}>View Profile</Link>
                </Button>
              </div>
            )}
            {!profileLoading && !profileError && !profile && (
              <div className="text-center">
                <p className="text-muted-foreground">No profile found for this user.</p>
                <Button asChild variant="default" size="sm" className="mt-2">
                  <Link to={`/profiles/add?userId=${selectedUser.id}`}>Create Profile</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {profile && !profileDeleted && (
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-foreground">3. Select Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {checkingSubscription && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                <span>Checking for active subscriptions...</span>
              </div>
            )}
            {activeSubscription && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="size-4" />
                <span>This user already has an active subscription.</span>
                <Button asChild variant="link" size="sm">
                  <Link to={`/user-subscriptions/${activeSubscription.id}`}>View Subscription</Link>
                </Button>
              </div>
            )}
            {!checkingSubscription && !activeSubscription && (
              <>
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
              </>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => navigate('/user-subscriptions')}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={!canSubmit} className="gap-1.5">
          {submitting && <Loader2 className="size-4 animate-spin" />}
          Generate Subscription
        </Button>
      </div>
    </div>
  )
}