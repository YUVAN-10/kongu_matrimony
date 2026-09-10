export const PAYMENT_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'success', label: 'Success' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'cancelled', label: 'Cancelled' },
]

// Excludes "refunded" — a payment can only reach that status via the
// dedicated Refund action on an existing successful payment, never as an
// initial state chosen at creation.
export const CREATABLE_PAYMENT_STATUS_OPTIONS = PAYMENT_STATUS_OPTIONS.filter(
  (option) => option.value !== 'refunded'
)

export const PAYMENT_METHOD_OPTIONS = [
  'UPI',
  'Credit Card',
  'Debit Card',
  'Net Banking',
  'Cash',
  'Cheque',
  'Bank Transfer',
  'Other',
]

/**
 * "Manual" is the only gateway actually functional today — this admin
 * panel records payments, it doesn't process them (see paymentService.js's
 * module comment on gateway-integration readiness). The others are
 * selectable for recording a payment that was actually collected through
 * that gateway outside this system; once a real integration exists, its
 * webhook handler would set this field automatically instead.
 */
export const GATEWAY_OPTIONS = ['Manual', 'Razorpay', 'PhonePe', 'Stripe', 'Other']

export const DEFAULT_CURRENCY = 'INR'
