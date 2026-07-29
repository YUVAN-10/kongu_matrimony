// Options + defaults for the Settings module. Adding a future setting is a
// two-line change: one field in DEFAULT_SETTINGS (so it always has a value,
// even for admins who saved the doc before the field existed) and, if it
// needs its own sidebar anchor, one entry in SETTINGS_SECTIONS. Nothing else
// in the architecture (service, hook, save/diff logic) needs to change.

export const LANGUAGE_OPTIONS = ['English', 'Tamil', 'Hindi', 'Telugu', 'Kannada', 'Malayalam']

export const TIMEZONE_OPTIONS = [
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Singapore',
  'Europe/London',
  'America/New_York',
  'UTC',
]

export const CURRENCY_OPTIONS = [
  { value: 'INR', label: 'INR (₹)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'AED', label: 'AED (د.إ)' },
  { value: 'SGD', label: 'SGD ($)' },
]

export const IMAGE_FORMAT_OPTIONS = ['jpg', 'jpeg', 'png', 'webp']

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const PHONE_REGEX = /^[+]?[0-9\s-]{7,15}$/

// One entry per top-level key in the settings document. Drives both the
// sidebar's anchor list and (via mergeWithDefaults in useSettings) the
// guaranteed shape of the form's defaultValues.
export const SETTINGS_SECTIONS = [
  { key: 'general', label: 'General' },
  { key: 'branding', label: 'Branding' },
  { key: 'contact', label: 'Contact' },
  { key: 'socialMedia', label: 'Social Media' },
  { key: 'subscription', label: 'Subscription' },
  { key: 'application', label: 'Application' },
  { key: 'security', label: 'Security' },
  { key: 'email', label: 'Email' },
  { key: 'storage', label: 'Storage' },
]

/**
 * Seed values written on first save and restored by "Restore Default
 * Settings". Every module that reads settings dynamically (see
 * settingsService.subscribeToSettings) can rely on every one of these keys
 * always being present, because useSettings merges the live document over
 * this object.
 */
export const DEFAULT_SETTINGS = {
  general: {
    appName: 'Kongu Matrimony',
    tagline: 'Find Your Perfect Match',
    description: '',
    copyright: `© ${new Date().getFullYear()} Kongu Matrimony. All rights reserved.`,
    defaultLanguage: 'English',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
  },
  branding: {
    logoUrl: '',
    faviconUrl: '',
    loginBackgroundUrl: '',
    primaryColor: '#C62828',
    secondaryColor: '#F9A825',
  },
  contact: {
    supportEmail: '',
    supportPhone: '',
    whatsappNumber: '',
    officeAddress: '',
  },
  socialMedia: {
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    youtube: '',
  },
  subscription: {
    defaultFreePlanId: '',
    defaultPremiumPlanId: '',
    defaultTrialDays: 7,
    autoExpireSubscription: true,
    reminderBeforeExpiryDays: 3,
  },
  application: {
    maintenanceMode: false,
    registrationEnabled: true,
    allowUserProfileCreation: true,
    allowAdminProfileCreation: true,
    enableChat: true,
    enableHoroscope: true,
    enableContactDetails: true,
    enablePartnerPreference: true,
  },
  security: {
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    sessionTimeoutMinutes: 60,
    rememberMeEnabled: true,
    twoFactorEnabled: false,
  },
  email: {
    smtpHost: '',
    smtpPort: '',
    smtpUsername: '',
    smtpPassword: '',
    senderName: '',
    senderEmail: '',
  },
  storage: {
    maxImageSizeMB: 5,
    allowedImageFormats: ['jpg', 'jpeg', 'png', 'webp'],
    maxPhotosPerProfile: 10,
  },
}
