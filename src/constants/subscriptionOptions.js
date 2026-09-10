// Canonical list of subscription permissions. Firestore is schemaless, so
// adding a new feature later is exactly one line here — no migration, no
// database design change. Older plan documents simply don't have the new
// key yet, which reads as "off" everywhere (see SubscriptionFeatureList).
export const SUBSCRIPTION_FEATURES = [
  { key: 'viewFullProfile', label: 'View Full Profile' },
  { key: 'viewContactDetails', label: 'View Contact Details' },
  { key: 'viewHoroscope', label: 'View Horoscope' },
  { key: 'chatEnabled', label: 'Chat Enabled' },
  { key: 'unlimitedProfileViews', label: 'Unlimited Profile Views' },
  { key: 'prioritySupport', label: 'Priority Support' },
  { key: 'downloadProfile', label: 'Download Profile' },
  { key: 'viewFamilyDetails', label: 'View Family Details' },
  { key: 'viewPartnerPreference', label: 'View Partner Preference' },
]

export const PLAN_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

/** Seed values for the "Create Premium Plan" quick-start button shown when
 * the plan list is empty. */
export const DEFAULT_PREMIUM_PLAN = {
  planName: 'Premium Membership',
  price: 999,
  durationDays: 365,
  description: 'Our most popular plan with full access to premium matchmaking features.',
  status: 'active',
  features: {
    viewFullProfile: true,
    viewContactDetails: true,
    viewHoroscope: true,
    chatEnabled: true,
    unlimitedProfileViews: true,
    prioritySupport: false,
    downloadProfile: false,
    viewFamilyDetails: false,
    viewPartnerPreference: false,
  },
}
