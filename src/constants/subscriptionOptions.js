export const COMMON_PLAN_FEATURES = [
  'Unlimited Search',
  'Unlimited Profiles in Search Results',
  'View 30 Contacts',
  'View 60 Contacts',
  'View 150 Contacts',
  'Unlimited Contact Views',
  'View Horoscope Details',
  'Unlimited Express Interests',
  'Priority Support',
  'Verified Profile Badge',
  'Direct WhatsApp Contact',
  'Personal Matchmaker Assistance',
]

export const PLAN_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export const DEFAULT_PREMIUM_PLAN = {
  code: 'PLATINUM',
  name: 'Platinum VIP Plan',
  price: 3999,
  validityDays: 180,
  searchResultLimit: null,
  contactQuota: 150,
  photoLimit: 15,
  features: ['Unlimited Search', 'View 150 Contacts', 'Unlimited Express Interests', 'Priority Support'],
  sortOrder: 3,
  status: 'active',
}

