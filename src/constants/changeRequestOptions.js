// Change request review status — distinct from Profile status (draft/active/
// hidden/deleted). See profileChangeRequestService.js.
export const CHANGE_REQUEST_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

// Categorizes WHY a request was rejected, shown alongside the free-text
// rejectionReason so the client sees both a quick category and the admin's
// actual description — same idea as blockReason on the Users module, one
// level more structured.
export const REJECTION_TYPE_OPTIONS = [
  { value: 'incomplete_information', label: 'Incomplete Information' },
  { value: 'incorrect_information', label: 'Incorrect Information' },
  { value: 'inappropriate_photo', label: 'Inappropriate / Invalid Photo' },
  { value: 'policy_violation', label: 'Policy Violation' },
  { value: 'other', label: 'Other' },
]
