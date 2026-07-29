import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { CircleAlert, Loader2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/hooks/useAuth'
import { searchUsersOnce } from '@/services/userService'
import { getSubscriptionsForUser } from '@/services/userSubscriptionService'
import { createPayment } from '@/services/paymentService'
import { PAYMENT_METHOD_OPTIONS, GATEWAY_OPTIONS, CREATABLE_PAYMENT_STATUS_OPTIONS } from '@/constants/paymentOptions'
import { formatCurrency, formatDate } from '@/utils/helpers'

function UserPicker({ selected, onSelect }) {
  const [term, setTerm] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)

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

  if (selected) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">{selected.name || '—'}</p>
          <p className="text-xs text-muted-foreground">{selected.email} · {selected.phone}</p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={() => onSelect(null)}>
          Change
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
                <p className="truncate text-xs text-muted-foreground">{user.email} · {user.phone}</p>
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

export default function AddPayment() {
  const { currentAdmin } = useAuth()
  const navigate = useNavigate()

  const [selectedUser, setSelectedUser] = useState(null)
  const [userSubscriptions, setUserSubscriptions] = useState([])
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false)
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState('')
  const [submitError, setSubmitError] = useState(null)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      amount: '',
      paymentMethod: '',
      gateway: 'Manual',
      transactionId: '',
      status: 'success',
      remarks: '',
    },
  })

  useEffect(() => {
    if (!selectedUser) {
      setUserSubscriptions([])
      setSelectedSubscriptionId('')
      return
    }
    let cancelled = false
    setLoadingSubscriptions(true)
    getSubscriptionsForUser(selectedUser.id)
      .then((subs) => {
        if (!cancelled) setUserSubscriptions(subs)
      })
      .finally(() => {
        if (!cancelled) setLoadingSubscriptions(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedUser])

  const selectedSubscription = userSubscriptions.find((sub) => sub.id === selectedSubscriptionId)

  useEffect(() => {
    if (selectedSubscription) {
      setValue('amount', selectedSubscription.amount)
    }
  }, [selectedSubscription, setValue])

  async function onSubmit(data) {
    setSubmitError(null)
    try {
      await createPayment(
        {
          ...data,
          userId: selectedUser.id,
          profileId: selectedSubscription.profileId,
          subscriptionId: selectedSubscription.id,
          planId: selectedSubscription.planId,
          planName: selectedSubscription.planName,
        },
        { admin: currentAdmin }
      )
      navigate('/payments', { state: { successMessage: 'Payment recorded successfully.' } })
    } catch (error) {
      setSubmitError(error.message || 'Could not record payment. Please try again.')
    }
  }

  const canSubmit = Boolean(selectedUser && selectedSubscription)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Add Payment</h1>
        <p className="text-sm text-muted-foreground">Manually record a payment against a user&apos;s subscription.</p>
      </div>

      {submitError && (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{submitError}</span>
        </div>
      )}

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-lg text-foreground">1. Select User</CardTitle>
        </CardHeader>
        <CardContent>
          <UserPicker selected={selectedUser} onSelect={setSelectedUser} />
        </CardContent>
      </Card>

      {selectedUser && (
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-foreground">2. Select Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSubscriptions ? (
              <p className="text-sm text-muted-foreground">Loading subscriptions…</p>
            ) : userSubscriptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">This user has no subscriptions yet.</p>
            ) : (
              <div className="space-y-1.5 sm:w-80">
                <Label>Subscription</Label>
                <Select value={selectedSubscriptionId} onValueChange={setSelectedSubscriptionId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subscription…" />
                  </SelectTrigger>
                  <SelectContent>
                    {userSubscriptions.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.planName} — {formatCurrency(sub.amount)} (expires {formatDate(sub.expiryDate)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedSubscription && (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="font-heading text-lg text-foreground">3. Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Plan</Label>
                <Input value={selectedSubscription.planName} disabled />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="amount">Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  {...register('amount', {
                    required: 'Amount is required.',
                    valueAsNumber: true,
                    min: { value: 0.01, message: 'Amount must be greater than 0.' },
                  })}
                />
                {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="transactionId">Transaction ID *</Label>
                <Input id="transactionId" {...register('transactionId', { required: 'Transaction ID is required.' })} />
                {errors.transactionId && <p className="text-xs text-destructive">{errors.transactionId.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Controller
                  name="paymentMethod"
                  control={control}
                  rules={{ required: 'Payment method is required.' }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="paymentMethod">
                        <SelectValue placeholder="Select…" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHOD_OPTIONS.map((method) => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.paymentMethod && <p className="text-xs text-destructive">{errors.paymentMethod.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gateway">Gateway</Label>
                <Controller
                  name="gateway"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="gateway">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GATEWAY_OPTIONS.map((gateway) => (
                          <SelectItem key={gateway} value={gateway}>
                            {gateway}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CREATABLE_PAYMENT_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea id="remarks" rows={3} {...register('remarks')} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/payments')}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || isSubmitting} className="gap-1.5">
              {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              Record Payment
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
