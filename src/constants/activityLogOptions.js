export const ACTIVITY_MODULES = [
  'Authentication',
  'Dashboard',
  'Users',
  'Profiles',
  'Subscription Plans',
  'User Subscriptions',
  'Payments',
  'Settings',
]

// Canonical, controlled vocabulary for the `action` field — every module
// picks from this exact list (module-specific detail like "blocked user
// John for Spam" belongs in `description`, not invented action values).
export const ACTIVITY_ACTIONS = [
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'restore', label: 'Restore' },
  { value: 'block', label: 'Block' },
  { value: 'unblock', label: 'Unblock' },
  { value: 'hide', label: 'Hide' },
  { value: 'publish', label: 'Publish' },
  { value: 'assign_subscription', label: 'Assign Subscription' },
  { value: 'renew_subscription', label: 'Renew Subscription' },
  { value: 'extend_subscription', label: 'Extend Subscription' },
  { value: 'cancel_subscription', label: 'Cancel Subscription' },
  { value: 'create_payment', label: 'Create Payment' },
  { value: 'refund_payment', label: 'Refund Payment' },
  { value: 'update_settings', label: 'Update Settings' },
  { value: 'submit_profile_change', label: 'Submit Profile Change' },
  { value: 'approve_profile_change', label: 'Approve Profile Change' },
  { value: 'reject_profile_change', label: 'Reject Profile Change' },
  { value: 'new_profile_submitted', label: 'New Profile Submitted' },
  { value: 'new_profile_resubmitted', label: 'New Profile Resubmitted' },
  { value: 'new_profile_approved', label: 'New Profile Approved' },
  { value: 'new_profile_rejected', label: 'New Profile Rejected' },
]

export const ACTIVITY_TARGET_TYPES = [
  'admin',
  'user',
  'profile',
  'subscription_plan',
  'subscription',
  'payment',
  'settings',
  'profile_change_request',
]
