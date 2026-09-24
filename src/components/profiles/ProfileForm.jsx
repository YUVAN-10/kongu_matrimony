import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { AlertCircle } from 'lucide-react'
import ProfileFormStepper from '@/components/profiles/ProfileFormStepper'
import ProfileStatusBadge from '@/components/profiles/ProfileStatusBadge'
import DraftConfirmationDialog from '@/components/profiles/DraftConfirmationDialog'
import PersonalDetailsStep from '@/components/profiles/steps/PersonalDetailsStep'
import PhysicalDetailsStep from '@/components/profiles/steps/PhysicalDetailsStep'
import AstrologyStep from '@/components/profiles/steps/AstrologyStep'
import HoroscopeStep from '@/components/profiles/steps/HoroscopeStep'
import EducationOccupationStep from '@/components/profiles/steps/EducationOccupationStep'
import FamilyDetailsStep from '@/components/profiles/steps/FamilyDetailsStep'
import AddressStep from '@/components/profiles/steps/AddressStep'
import CommunicationStep from '@/components/profiles/steps/CommunicationStep'
import LifestyleStep from '@/components/profiles/steps/LifestyleStep'
import PartnerPreferenceStep from '@/components/profiles/steps/PartnerPreferenceStep'
import AboutStep from '@/components/profiles/steps/AboutStep'
import PhotosStep from '@/components/profiles/steps/PhotosStep'
import ReviewSubmitStep from '@/components/profiles/steps/ReviewSubmitStep'
import { PROFILE_STEPS, DEFAULT_PROFILE_VALUES } from '@/constants/profileOptions'
import { calculateAge, formatForDateInput, formatDateDDMMYYYY } from '@/utils/helpers'
import { saveDraft, publishProfile } from '@/services/profileService'
import { createProfileChangeRequest } from '@/services/profileChangeRequestService'
import { saveProfileDraft, deleteProfileDraft } from '@/services/profileDraftService'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/context/NotificationContext'

function computeProfileDiff(initial, updated) {
  const diff = {}
  if (!initial || !updated) return diff

  function compare(oldObj, newObj, prefix = '') {
    if (!newObj || typeof newObj !== 'object') return
    Object.keys(newObj).forEach((key) => {
      const path = prefix ? `${prefix}.${key}` : key
      if (path.startsWith('system.')) return

      const oldVal = oldObj ? oldObj[key] : undefined
      const newVal = newObj[key]

      if (typeof newVal === 'object' && newVal !== null && !Array.isArray(newVal)) {
        compare(oldVal, newVal, path)
      } else if (JSON.stringify(oldVal) !== JSON.stringify(newVal) && newVal !== undefined && newVal !== '') {
        diff[path] = {
          oldValue: oldVal ?? '—',
          newValue: newVal,
        }
      }
    })
  }

  compare(initial, updated)
  return diff
}

const MANDATORY_FIELDS = [
  'personal.fullName',
  'personal.gender',
  'personal.mobile',
  'address.city',
]

/**
 * Merges DEFAULT_PROFILE_VALUES (every field explicitly '' / null / [])
 * under whatever real data exists, per section. Real values always win —
 * this only fills gaps, so a doc saved before some field existed
 * still ends up with '' there instead of undefined.
 */
function parseRange(rangeStr) {
  if (!rangeStr || typeof rangeStr !== 'string') return { from: '', to: '' }
  const parts = rangeStr.split('-').map((s) => s.replace(/[^0-9]/g, '').trim())
  if (parts.length >= 2) {
    return { from: parts[0] || '', to: parts[1] || '' }
  }
  return { from: parts[0] || '', to: '' }
}

function buildDefaultValues(initialValues, linkedUser) {
  const src = initialValues || {}
  const u = linkedUser || {}

  const personal = typeof src.personal === 'object' && src.personal !== null ? src.personal : {}
  const physical = typeof src.physical === 'object' && src.physical !== null ? src.physical : {}
  const astrology = typeof src.astrology === 'object' && src.astrology !== null ? src.astrology : {}
  const educationObj = typeof src.education === 'object' && src.education !== null ? src.education : {}
  const uEducationObj = typeof u.education === 'object' && u.education !== null ? u.education : {}
  const occupation = typeof src.occupation === 'object' && src.occupation !== null ? src.occupation : {}
  const family = typeof src.family === 'object' && src.family !== null ? src.family : {}
  const address = typeof src.address === 'object' && src.address !== null ? src.address : {}
  const communication = typeof src.communication === 'object' && src.communication !== null ? src.communication : {}
  const lifestyle = typeof src.lifestyle === 'object' && src.lifestyle !== null ? src.lifestyle : {}
  const partnerPreference = typeof src.partnerPreference === 'object' && src.partnerPreference !== null ? src.partnerPreference : {}
  const about = typeof src.about === 'object' && src.about !== null ? src.about : (typeof src.aboutMe === 'object' && src.aboutMe !== null ? src.aboutMe : {})
  const photos = typeof src.photos === 'object' && src.photos !== null ? src.photos : {}

  const educationVal =
    (typeof educationObj.education === 'string' && educationObj.education ? educationObj.education : '') ||
    (typeof educationObj.highestQualification === 'string' && educationObj.highestQualification ? educationObj.highestQualification : '') ||
    (typeof educationObj.qualification === 'string' && educationObj.qualification ? educationObj.qualification : '') ||
    (typeof uEducationObj.education === 'string' && uEducationObj.education ? uEducationObj.education : '') ||
    (typeof uEducationObj.highestQualification === 'string' && uEducationObj.highestQualification ? uEducationObj.highestQualification : '') ||
    (typeof src.highestQualification === 'string' && src.highestQualification ? src.highestQualification : '') ||
    (typeof src.qualification === 'string' && src.qualification ? src.qualification : '') ||
    (typeof src.education === 'string' ? src.education : '') ||
    (typeof u.highestQualification === 'string' ? u.highestQualification : '') ||
    (typeof u.qualification === 'string' ? u.qualification : '') ||
    (typeof u.education === 'string' ? u.education : '') ||
    (typeof src.educationLevel === 'string' ? src.educationLevel : '') ||
    ''

  const formatHobbies = (val) => (Array.isArray(val) ? val.join(', ') : (typeof val === 'string' ? val : ''))

  const ageRangeParsed = parseRange(partnerPreference.prefAgeRange || src.prefAgeRange)
  const heightRangeParsed = parseRange(partnerPreference.prefHeightRange || src.prefHeightRange)

  const isPhysicallyChallengedNormalized =
    physical.isPhysicallyChallenged != null
      ? (physical.isPhysicallyChallenged === true || physical.isPhysicallyChallenged === 'Yes' ? 'Yes' : 'No')
      : (src.isPhysicallyChallenged != null
          ? (src.isPhysicallyChallenged === true || src.isPhysicallyChallenged === 'Yes' ? 'Yes' : 'No')
          : (physical.physicallyChallenged != null
              ? (physical.physicallyChallenged === 'Yes' || physical.physicallyChallenged === true ? 'Yes' : 'No')
              : (src.physicallyChallenged != null ? (src.physicallyChallenged === 'Yes' || src.physicallyChallenged === true ? 'Yes' : 'No') : '')))

  const rawDosham =
    astrology.hasDosham ??
    astrology.dosham ??
    astrology.dhosam ??
    astrology.hasDhosam ??
    src.hasDosham ??
    src.dosham ??
    src.dhosam ??
    src.hasDhosam

  const hasDoshamNormalized =
    rawDosham != null && rawDosham !== ''
      ? (rawDosham === true || rawDosham === 'Yes' || rawDosham === 'yes' || rawDosham === 'TRUE' || rawDosham === '1' ? 'Yes' : 'No')
      : ''

  const rawDob = src.dateOfBirth || src.dob || personal.dob || personal.dateOfBirth || ''
  const parsedFormatted = rawDob ? formatDateDDMMYYYY(rawDob) : ''
  const formattedDob = parsedFormatted && parsedFormatted !== '—' ? parsedFormatted : (typeof rawDob === 'string' ? rawDob : '')
  const initialAge = formattedDob ? calculateAge(formattedDob) : (src.age || personal.age || '')

  return {
    personal: {
      ...DEFAULT_PROFILE_VALUES.personal,
      ...personal,
      fullName: src.fullName || src.name || personal.fullName || u.fullName || u.name || '',
      gender: (src.gender || personal.gender || u.gender || '').toLowerCase(),
      dob: formattedDob,
      dateOfBirth: formattedDob,
      age: initialAge !== null && initialAge !== undefined ? initialAge : '',
      maritalStatus: src.maritalStatus || personal.maritalStatus || '',
      mobile: src.mobile || src.phone || personal.mobile || personal.mobileNumber || u.phone || u.mobile || '',
      alternateMobile: src.alternateMobile || src.alternatePhone || communication.alternateMobile || personal.alternateMobile || personal.alternatePhone || '',
      email: src.email || personal.email || u.email || '',
      religion: src.religion || personal.religion || '',
      caste: src.caste || personal.caste || '',
      subsect: src.subsect || src.subCaste || personal.subsect || personal.subCaste || '',
      motherTongue: src.motherTongue || personal.motherTongue || '',
    },
    physical: {
      ...DEFAULT_PROFILE_VALUES.physical,
      ...physical,
      heightCm: physical.heightCm || physical.height || src.heightCm || src.height || '',
      weightKg: physical.weightKg || physical.weight || src.weightKg || src.weight || '',
      bodyType: physical.bodyType || src.bodyType || '',
      complexion: physical.complexion || src.complexion || '',
      bloodGroup: physical.bloodGroup || src.bloodGroup || '',
      isPhysicallyChallenged: isPhysicallyChallengedNormalized || '',
      disabilityDetails:
        physical.disabilityDetails ||
        physical.physicallyChallengedDetails ||
        src.disabilityDetails ||
        src.physicallyChallengedDetails ||
        '',
    },
    astrology: {
      ...DEFAULT_PROFILE_VALUES.astrology,
      ...astrology,
      timeOfBirth: astrology.timeOfBirth || astrology.birthTime || src.timeOfBirth || src.birthTime || '',
      placeOfBirth: astrology.placeOfBirth || astrology.birthPlace || src.placeOfBirth || src.birthPlace || '',
      star: astrology.star || src.star || '',
      rasi: astrology.rasi || astrology.raasi || src.rasi || src.raasi || '',
      raasi: astrology.raasi || astrology.rasi || src.raasi || src.rasi || '',
      lakuna: astrology.lakuna || astrology.lagnam || astrology.lagna || src.lakuna || src.lagnam || src.lagna || '',
      hasDosham: hasDoshamNormalized || '',
      gothram: astrology.gothram || astrology.gothra || src.gothram || src.gothra || src.koottam || '',
      kulaTheivaTemple:
        astrology.kulaTheivaTemple ||
        astrology.kuladeivam ||
        src.kulaTheivaTemple ||
        src.kuladeivam ||
        '',
      rasiChart: astrology.rasiChart || src.rasiChart || {},
      amsamChart: astrology.amsamChart || src.amsamChart || {},
      horoscopeChart: astrology.horoscopeChart || src.horoscopeChart || {},
    },
    education: {
      ...DEFAULT_PROFILE_VALUES.education,
      ...educationObj,
      education: educationVal,
      highestQualification: educationVal,
      qualification: educationVal,
      educationDetail: educationObj.educationDetail || educationObj.details || src.educationDetail || src.details || '',
    },
    occupation: {
      ...DEFAULT_PROFILE_VALUES.occupation,
      ...occupation,
      occupation: occupation.occupation || occupation.jobTitle || (typeof src.occupation === 'string' ? src.occupation : '') || src.jobDetails || '',
      employedIn: occupation.employedIn || src.employedIn || '',
      currentCompany:
        occupation.currentCompany ||
        occupation.organization ||
        occupation.companyName ||
        src.currentCompany ||
        src.companyName ||
        src.organization ||
        '',
      monthlyIncome: occupation.monthlyIncome || src.monthlyIncome || '',
      annualIncome: occupation.annualIncome || src.annualIncome || 0,
      workLocation: occupation.workLocation || src.workLocation || '',
    },
    family: {
      ...DEFAULT_PROFILE_VALUES.family,
      ...family,
      fatherName: family.fatherName || src.fatherName || '',
      fatherOccupation: family.fatherOccupation || src.fatherOccupation || '',
      motherName: family.motherName || src.motherName || '',
      motherOccupation: family.motherOccupation || src.motherOccupation || '',
      brothers: family.brothers != null ? family.brothers : (src.brothersCount != null ? src.brothersCount : ''),
      brothersCount: family.brothersCount != null ? family.brothersCount : (src.brothersCount != null ? src.brothersCount : (family.brothers != null ? family.brothers : '')),
      marriedBrothers: family.marriedBrothers != null ? family.marriedBrothers : (src.marriedBrothers != null ? src.marriedBrothers : (src.brothersMarriedCount != null ? src.brothersMarriedCount : '')),
      brothersMarriedCount: family.brothersMarriedCount != null ? family.brothersMarriedCount : (src.brothersMarriedCount != null ? src.brothersMarriedCount : (src.marriedBrothers != null ? src.marriedBrothers : (family.marriedBrothers != null ? family.marriedBrothers : ''))),
      sisters: family.sisters != null ? family.sisters : (src.sistersCount != null ? src.sistersCount : ''),
      sistersCount: family.sistersCount != null ? family.sistersCount : (src.sistersCount != null ? src.sistersCount : (family.sisters != null ? family.sisters : '')),
      marriedSisters: family.marriedSisters != null ? family.marriedSisters : (src.marriedSisters != null ? src.marriedSisters : (src.sistersMarriedCount != null ? src.sistersMarriedCount : '')),
      sistersMarriedCount: family.sistersMarriedCount != null ? family.sistersMarriedCount : (src.sistersMarriedCount != null ? src.sistersMarriedCount : (src.marriedSisters != null ? src.marriedSisters : (family.marriedSisters != null ? family.marriedSisters : ''))),
      familyType: family.familyType || src.familyType || '',
      familyStatus: family.familyStatus || src.familyStatus || '',
      familyValues: family.familyValues || src.familyValues || '',
      familyMonthlyIncome:
        family.familyMonthlyIncome ||
        family.familyIncome ||
        src.familyMonthlyIncome ||
        src.familyIncome ||
        (family.familyAnnualIncome ? String(Math.round(Number(family.familyAnnualIncome) / 12)) : (src.familyAnnualIncome ? String(Math.round(Number(src.familyAnnualIncome) / 12)) : '')) ||
        '',
      familyAnnualIncome: family.familyAnnualIncome || src.familyAnnualIncome || 0,
    },
    address: {
      ...DEFAULT_PROFILE_VALUES.address,
      ...address,
      address:
        (typeof address.address === 'string' ? address.address : '') ||
        (typeof address.addressLine === 'string' ? address.addressLine : '') ||
        (typeof address.street === 'string' ? address.street : '') ||
        (typeof src.addressLine === 'string' ? src.addressLine : '') ||
        (typeof src.street === 'string' ? src.street : '') ||
        (typeof src.address === 'string' ? src.address : '') ||
        (typeof u.address === 'string' ? u.address : '') ||
        '',
      village: src.village || address.village || '',
      city: src.city || (typeof src.city === 'string' ? src.city : '') || address.city || (typeof u.city === 'string' ? u.city : '') || '',
      district: src.district || address.district || '',
      state: src.state || address.state || (typeof u.state === 'string' ? u.state : '') || '',
      country: src.country || address.country || (typeof u.country === 'string' ? u.country : '') || '',
      postalCode: src.postalCode || src.pincode || address.postalCode || address.pincode || '',
    },
    communication: {
      ...DEFAULT_PROFILE_VALUES.communication,
      ...communication,
      preferredContactMethod: src.preferredContactMethod || communication.preferredContactMethod || '',
      whatsappNumber: src.whatsappNumber || communication.whatsappNumber || (typeof src.mobile === 'string' ? src.mobile : '') || (typeof u.phone === 'string' ? u.phone : '') || '',
      alternateMobile: src.alternateMobile || src.alternatePhone || communication.alternateMobile || personal.alternateMobile || personal.alternatePhone || '',
      alternateEmail: src.alternateEmail || communication.alternateEmail || '',
      bestTimeToContact: src.bestTimeToContact || communication.bestTimeToContact || '',
    },
    lifestyle: {
      ...DEFAULT_PROFILE_VALUES.lifestyle,
      ...lifestyle,
      eatingHabits: src.eatingHabits || src.diet || lifestyle.eatingHabits || lifestyle.diet || '',
      smokingHabits: src.smokingHabits || src.smoking || lifestyle.smokingHabits || lifestyle.smoking || '',
      drinkingHabits: src.drinkingHabits || src.drinking || lifestyle.drinkingHabits || lifestyle.drinking || '',
      hobbies: formatHobbies(src.hobbies || lifestyle.hobbies),
      interests: formatHobbies(src.interests || lifestyle.interests),
      spokenLanguages: formatHobbies(src.spokenLanguages || src.languagesKnown || lifestyle.spokenLanguages || lifestyle.languagesKnown),
    },
    partnerPreference: {
      ...DEFAULT_PROFILE_VALUES.partnerPreference,
      ...partnerPreference,
      ageFrom: src.prefAgeFrom || partnerPreference.ageFrom || ageRangeParsed.from || '',
      ageTo: src.prefAgeTo || partnerPreference.ageTo || ageRangeParsed.to || '',
      heightFrom: src.prefHeightFrom || partnerPreference.heightFrom || heightRangeParsed.from || '',
      heightTo: src.prefHeightTo || partnerPreference.heightTo || heightRangeParsed.to || '',
      religion: src.prefReligion || partnerPreference.religion || '',
      caste: src.prefCaste || partnerPreference.caste || '',
      education: src.prefEducation || partnerPreference.education || '',
      occupation: src.prefOccupation || partnerPreference.occupation || '',
      prefCountry: src.prefCountry || src.prefLocation || src.location || partnerPreference.prefCountry || partnerPreference.location || '',
      partnerExpectations: src.partnerExpectations || src.expectations || partnerPreference.partnerExpectations || partnerPreference.expectations || '',
    },
    about: {
      ...DEFAULT_PROFILE_VALUES.about,
      ...about,
      bio:
        src.bio ||
        src.aboutMe ||
        about.bio ||
        about.aboutMe ||
        (typeof about === 'string' ? about : '') ||
        '',
      aboutFamily: src.aboutFamily || about.aboutFamily || (typeof src.aboutFamily === 'string' ? src.aboutFamily : (src.aboutMe?.aboutFamily || '')) || '',
      partnerExpectations: src.partnerExpectations || src.expectations || about.partnerExpectations || about.expectations || '',
    },
    photos: {
      ...DEFAULT_PROFILE_VALUES.photos,
      ...photos,
      main: (typeof photos.main === 'object' && photos.main !== null)
        ? photos.main
        : (photos.profileImageUrl || (typeof photos.main === 'string' ? photos.main : '') || src.profileImageUrl || src.photoURL
            ? {
                url: typeof photos.profileImageUrl === 'string' && photos.profileImageUrl ? photos.profileImageUrl : (typeof photos.main === 'string' ? photos.main : src.profileImageUrl || src.photoURL),
                path: typeof photos.profileImageUrl === 'string' && photos.profileImageUrl ? photos.profileImageUrl : (typeof photos.main === 'string' ? photos.main : src.profileImageUrl || src.photoURL),
              }
            : null),
      profileImageUrl: photos.profileImageUrl || (typeof photos.main === 'string' ? photos.main : photos.main?.url) || src.profileImageUrl || src.photoURL || '',
      gallery: Array.isArray(photos.gallery) ? photos.gallery : (Array.isArray(src.gallery) ? src.gallery : []),
    },
    profileImageUrl: photos.profileImageUrl || (typeof photos.main === 'string' ? photos.main : photos.main?.url) || src.profileImageUrl || src.photoURL || '',
    photoURL: photos.profileImageUrl || (typeof photos.main === 'string' ? photos.main : photos.main?.url) || src.profileImageUrl || src.photoURL || '',
    gallery: Array.isArray(photos.gallery) ? photos.gallery : (Array.isArray(src.gallery) ? src.gallery : []),
  }
}

const STEP_COMPONENTS = [
  PersonalDetailsStep,
  PhysicalDetailsStep,
  AstrologyStep,
  HoroscopeStep,
  EducationOccupationStep,
  FamilyDetailsStep,
  AddressStep,
  CommunicationStep,
  LifestyleStep,
  PartnerPreferenceStep,
  AboutStep,
  PhotosStep,
  ReviewSubmitStep,
]
const PHOTOS_STEP_INDEX = PROFILE_STEPS.findIndex((s) => s.key === 'photos')

export default function ProfileForm({ mode, profileId, initialValues, linkedUser, onSaved }) {
  const { currentAdmin } = useAuth()
  const { pushNotification } = useNotifications()

  const [currentStep, setCurrentStep] = useState(0)
  const [draftDialogOpen, setDraftDialogOpen] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [savingChanges, setSavingChanges] = useState(false)
  const [formError, setFormError] = useState(null)
  const [draftSavedFeedback, setDraftSavedFeedback] = useState(null)

  const isNew = mode === 'create'
  const currentStatus = initialValues?.system?.status || initialValues?.status
  const isLastStep = currentStep === PROFILE_STEPS.length - 1

  const form = useForm({
    defaultValues: buildDefaultValues(initialValues, linkedUser),
  })
  const { handleSubmit, trigger, getValues, reset, formState } = form

  useEffect(() => {
    if (initialValues || linkedUser) {
      reset(buildDefaultValues(initialValues, linkedUser))
    }
  }, [initialValues, linkedUser, reset])

  async function goNext() {
    if (currentStep === 0) {
      const valid = await trigger(MANDATORY_FIELDS)
      if (!valid) return
    }
    setCurrentStep((step) => Math.min(step + 1, PROFILE_STEPS.length - 1))
  }

  function goBack() {
    setCurrentStep((step) => Math.max(step - 1, 0))
  }

  async function confirmSaveDraft() {
    setFormError(null)
    setDraftSavedFeedback(null)
    try {
      const currentValues = getValues()
      await saveProfileDraft(profileId, currentValues, {
        admin: currentAdmin,
        profileName: currentValues.personal?.fullName || linkedUser?.name,
      })
      await saveDraft(profileId, currentValues, { admin: currentAdmin, isNew })
      setDraftSavedFeedback('Draft Saved Successfully. You can continue editing or view it under Saved Drafts.')
      onSaved({ status: 'draft' })
    } catch (error) {
      setFormError(error.message || 'Could not save draft. Please try again.')
      throw error
    }
  }

  async function validateAndNavigateToErrorStep() {
    const valid = await trigger()
    if (!valid) {
      const errors = form.formState.errors
      const errorKeys = Object.keys(errors || {})
      if (errorKeys.length > 0) {
        const firstKey = errorKeys[0]
        const stepMap = {
          personal: 0,
          physical: 1,
          astrology: 2,
          education: 4,
          occupation: 4,
          family: 5,
          address: 6,
          communication: 7,
          lifestyle: 8,
          partnerPreference: 9,
          about: 10,
          photos: 11,
        }
        const errStep = stepMap[firstKey] ?? 0
        setCurrentStep(errStep)
      }
      setFormError('Please fix the validation errors marked in red before submitting.')
      return false
    }
    return true
  }

  async function handlePublish() {
    const valid = await validateAndNavigateToErrorStep()
    if (!valid) return

    setFormError(null)
    setPublishing(true)
    try {
      // Admin workflow: Direct update to live profile (PUT /api/admin/users/:id)
      const result = await publishProfile(profileId, getValues(), { admin: currentAdmin, isNew })
      if (result?.isPartiallySaved && pushNotification) {
        pushNotification({
          id: `partial-save-${Date.now()}`,
          type: 'warning',
          title: 'Profile Partially Saved',
          description: 'Profile update partially saved. Backend did not persist some fields.',
          createdAt: new Date(),
        })
      }
      onSaved({
        status: 'active',
        isPendingApproval: false,
        isPartiallySaved: result?.isPartiallySaved,
        unpersistedFields: result?.unpersistedFields,
      })
    } catch (error) {
      setFormError(error.message || 'Could not publish profile. Please try again.')
    } finally {
      setPublishing(false)
    }
  }

  async function handleSaveChanges() {
    const valid = await validateAndNavigateToErrorStep()
    if (!valid) return

    setFormError(null)
    setSavingChanges(true)
    try {
      // Admin workflow: Direct update to live profile (PUT /api/admin/users/:id)
      const result = await publishProfile(profileId, getValues(), { admin: currentAdmin, isNew })
      if (result?.isPartiallySaved && pushNotification) {
        pushNotification({
          id: `partial-save-${Date.now()}`,
          type: 'warning',
          title: 'Profile Partially Saved',
          description: 'Profile update partially saved. Backend did not persist some fields.',
          createdAt: new Date(),
        })
      }
      onSaved({
        status: currentStatus || 'active',
        isPendingApproval: false,
        isPartiallySaved: result?.isPartiallySaved,
        unpersistedFields: result?.unpersistedFields,
      })
    } catch (error) {
      setFormError(error.message || 'Could not save changes. Please try again.')
    } finally {
      setSavingChanges(false)
    }
  }

  const primaryActions = [
    { label: 'Save as Draft', variant: 'outline', onClick: () => setDraftDialogOpen(true) },
    ...(isLastStep
      ? [{ label: 'Publish Profile', onClick: handlePublish, loading: publishing }]
      : [{ label: 'Save Changes', onClick: handleSaveChanges, loading: savingChanges }]),
  ]

  const StepComponent = STEP_COMPONENTS[currentStep]

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(() => {})} noValidate className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {currentStatus && <ProfileStatusBadge status={currentStatus} />}
          {linkedUser && (
            <span className="text-xs text-muted-foreground">
              Linked to {linkedUser.name || linkedUser.email} ({linkedUser.email})
            </span>
          )}
        </div>

        {formError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{formError}</span>
          </div>
        )}

        {formState.errors.personal && currentStep !== 0 && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>Full Name, Gender, and Mobile Number are required before publishing.</span>
          </div>
        )}

        <ProfileFormStepper
          currentStep={currentStep}
          onStepClick={setCurrentStep}
          onBack={goBack}
          onNext={goNext}
          isLastStep={isLastStep}
          primaryActions={primaryActions}
        >
          <StepComponent {...(currentStep === PHOTOS_STEP_INDEX ? { profileId } : {})} />
        </ProfileFormStepper>
      </form>

      <DraftConfirmationDialog
        open={draftDialogOpen}
        onOpenChange={setDraftDialogOpen}
        onConfirm={confirmSaveDraft}
      />
    </FormProvider>
  )
}
