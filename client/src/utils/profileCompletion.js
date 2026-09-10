/**
 * Rough completion percentage across the profile's real schema sections
 * (personal/occupation/education/family/partnerPreference/address/photos —
 * see profileService.js for the canonical field list). Shared by Draft
 * Profiles and New Profile Approvals, both of which need it to gauge how
 * ready a profile is for review.
 */
export function calculateProfileCompletion(profile) {
  let totalFields = 0
  let completedFields = 0

  function check(value) {
    totalFields++
    if (value) completedFields++
  }

  check(profile.personal?.fullName)
  check(profile.personal?.email)
  check(profile.personal?.mobileNumber)
  check(profile.personal?.gender)
  check(profile.personal?.dob)

  check(profile.occupation?.jobTitle)
  check(profile.occupation?.employedIn)
  check(profile.education?.highestQualification)

  check(profile.family?.fatherName)
  check(profile.family?.motherName)

  check(profile.partnerPreference?.ageFrom)
  check(profile.partnerPreference?.religion)
  check(profile.partnerPreference?.location)

  check(profile.address?.city)
  check(profile.photos?.main?.url)

  return Math.round((completedFields / totalFields) * 100)
}
