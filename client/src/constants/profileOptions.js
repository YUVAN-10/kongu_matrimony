// Shared dropdown option lists used across the profile form steps, the
// filters panel, and the table — one place to edit instead of duplicating
// arrays in every step file.

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
]

export const MARITAL_STATUS_OPTIONS = [
  'Never Married',
  'Divorced',
  'Widowed',
  'Awaiting Divorce',
]

export const RELIGION_OPTIONS = [
  'Hindu',
  'Muslim',
  'Christian',
  'Sikh',
  'Jain',
  'Buddhist',
  'Other',
]

export const BODY_TYPE_OPTIONS = ['Slim', 'Average', 'Athletic', 'Heavy']
export const COMPLEXION_OPTIONS = ['Fair', 'Wheatish', 'Dark']
export const BLOOD_GROUP_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
export const YES_NO_OPTIONS = ['No', 'Yes']
export const DOSHAM_OPTIONS = ['None', 'Yes', 'Not Sure']

export const EDUCATION_OPTIONS = [
  'High School',
  "Bachelor's Degree",
  "Master's Degree",
  'Doctorate',
  'Diploma',
  'Other',
]

export const EMPLOYED_IN_OPTIONS = [
  'Private',
  'Government',
  'Business',
  'Self-Employed',
  'Not Working',
]

export const FAMILY_TYPE_OPTIONS = ['Nuclear', 'Joint']
export const FAMILY_STATUS_OPTIONS = ['Middle Class', 'Upper Middle Class', 'Rich', 'Affluent']

export const CONTACT_METHOD_OPTIONS = ['Phone', 'Email', 'WhatsApp']

export const DIET_OPTIONS = ['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan']
export const HABIT_OPTIONS = ['No', 'Yes', 'Occasionally']

export const SUBSCRIPTION_OPTIONS = [
  { value: 'free', label: 'Free' },
  { value: 'premium', label: 'Premium' },
]

export const PROFILE_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'active', label: 'Active' },
  { value: 'hidden', label: 'Hidden' },
  { value: 'rejected', label: 'Rejected' },
]

export const PROFILE_STEPS = [
  { key: 'personal', title: 'Personal Details' },
  { key: 'physical', title: 'Physical Details' },
  { key: 'astrology', title: 'Astrology' },
  { key: 'education', title: 'Education & Occupation' },
  { key: 'family', title: 'Family Details' },
  { key: 'address', title: 'Address' },
  { key: 'communication', title: 'Communication' },
  { key: 'lifestyle', title: 'Lifestyle' },
  { key: 'partnerPreference', title: 'Partner Preference' },
  { key: 'about', title: 'About & Expectation' },
  { key: 'photos', title: 'Photos' },
  { key: 'review', title: 'Review & Submit' },
]

/**
 * Every field across all 12 steps, explicitly defaulted to '' (or null/[]
 * where that's the more correct empty value) instead of being left
 * undefined. Two reasons this matters, not just Firestore:
 *  - React warns/misbehaves when a controlled input's value flips from
 *    undefined to a string later (uncontrolled -> controlled).
 *  - It documents the full field set in one place — the actual source of
 *    the "80+ fields, only 3 mandatory" shape.
 * ProfileForm.jsx merges this under initialValues/linkedUser data, so
 * anything real always wins; this only fills genuine gaps.
 */
export const DEFAULT_PROFILE_VALUES = {
  personal: {
    fullName: '',
    gender: '',
    dob: '',
    mobileNumber: '',
    alternatePhone: '',
    email: '',
    maritalStatus: '',
    religion: '',
    motherTongue: '',
  },
  physical: {
    heightCm: '',
    weightKg: '',
    bodyType: '',
    complexion: '',
    bloodGroup: '',
    physicallyChallenged: '',
    physicallyChallengedDetails: '',
  },
  astrology: {
    birthTime: '',
    birthPlace: '',
    star: '',
    raasi: '',
    gothra: '',
    dosham: '',
  },
  education: {
    highestQualification: '',
    details: '',
  },
  occupation: {
    jobTitle: '',
    employedIn: '',
    organization: '',
    monthlyIncome: '',
    annualIncome: 0,
  },
  family: {
    fatherName: '',
    fatherOccupation: '',
    motherName: '',
    motherOccupation: '',
    brothers: '',
    sisters: '',
    familyType: '',
    familyStatus: '',
    familyMonthlyIncome: '',
    familyAnnualIncome: 0,
  },
  address: {
    addressLine: '',
    city: '',
    district: '',
    state: '',
    country: '',
    pincode: '',
  },
  communication: {
    preferredContactMethod: '',
    whatsappNumber: '',
    alternateEmail: '',
    bestTimeToContact: '',
  },
  lifestyle: {
    diet: '',
    smoking: '',
    drinking: '',
    hobbies: '',
    interests: '',
  },
  partnerPreference: {
    ageFrom: '',
    ageTo: '',
    heightFrom: '',
    heightTo: '',
    religion: '',
    education: '',
    occupation: '',
    location: '',
    expectations: '',
  },
  about: {
    aboutMe: '',
    expectations: '',
  },
  photos: {
    main: null,
    gallery: [],
  },
}
