import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { AlertCircle } from 'lucide-react'
import ProfileFormStepper from '@/components/profiles/ProfileFormStepper'
import ProfileStatusBadge from '@/components/profiles/ProfileStatusBadge'
import DraftConfirmationDialog from '@/components/profiles/DraftConfirmationDialog'
import PersonalDetailsStep from '@/components/profiles/steps/PersonalDetailsStep'
import PhysicalDetailsStep from '@/components/profiles/steps/PhysicalDetailsStep'
import AstrologyStep from '@/components/profiles/steps/AstrologyStep'
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
import { saveDraft, publishProfile, updateProfile } from '@/services/profileService'
import { useAuth } from '@/hooks/useAuth'

const MANDATORY_FIELDS = ['personal.fullName', 'personal.gender', 'personal.mobileNumber']

/**
 * Merges DEFAULT_PROFILE_VALUES (every field explicitly '' / null / [])
 * under whatever real data exists, per section. Real values always win —
 * this only fills gaps, so a Firestore doc saved before some field existed
 * still ends up with '' there instead of undefined.
 */
function buildDefaultValues(initialValues, linkedUser) {
  const source = initialValues || {}
  const merged = {}

  for (const section of Object.keys(DEFAULT_PROFILE_VALUES)) {
    merged[section] = { ...DEFAULT_PROFILE_VALUES[section], ...(source[section] || {}) }
  }

  if (!initialValues && linkedUser) {
    merged.personal = {
      ...merged.personal,
      fullName: linkedUser.name || '',
      email: linkedUser.email || '',
      mobileNumber: linkedUser.phone || '',
      gender: linkedUser.gender || '',
    }
  }

  return merged
}

const STEP_COMPONENTS = [
  PersonalDetailsStep,
  PhysicalDetailsStep,
  AstrologyStep,
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
const PHOTOS_STEP_INDEX = 10

/**
 * Shared 12-step form used by both AddProfile.jsx and EditProfile.jsx — the
 * entire stepper, validation, and draft/publish logic lives here exactly
 * once. `mode` + whether the loaded profile is currently a Draft together
 * decide which save actions are shown:
 *  - create, or editing an existing Draft -> "Save as Draft" + "Publish"
 *  - editing an already Active/Hidden profile -> a single "Save Changes"
 *    (editing a live profile should never silently revert it to Draft)
 */
export default function ProfileForm({ mode, profileId, initialValues, linkedUser, onSaved }) {
  const { currentAdmin } = useAuth()

  const [currentStep, setCurrentStep] = useState(0)
  const [draftDialogOpen, setDraftDialogOpen] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [savingChanges, setSavingChanges] = useState(false)
  const [formError, setFormError] = useState(null)

  const isNew = mode === 'create'
  const currentStatus = initialValues?.system?.status
  const isDraftEligible = isNew || currentStatus === 'draft'
  const isLastStep = currentStep === PROFILE_STEPS.length - 1

  const form = useForm({
    defaultValues: buildDefaultValues(initialValues, linkedUser),
  })
  const { handleSubmit, trigger, getValues, formState } = form

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
    try {
      await saveDraft(profileId, getValues(), { admin: currentAdmin, isNew })
      onSaved({ status: 'draft' })
    } catch (error) {
      setFormError(error.message || 'Could not save draft. Please try again.')
      throw error
    }
  }

  async function handlePublish() {
    const valid = await trigger(MANDATORY_FIELDS)
    if (!valid) {
      setCurrentStep(0)
      return
    }
    setFormError(null)
    setPublishing(true)
    try {
      await publishProfile(profileId, getValues(), { admin: currentAdmin, isNew })
      onSaved({ status: 'active' })
    } catch (error) {
      setFormError(error.message || 'Could not publish profile. Please try again.')
    } finally {
      setPublishing(false)
    }
  }

  async function handleSaveChanges() {
    setFormError(null)
    setSavingChanges(true)
    try {
      await updateProfile(profileId, getValues(), { admin: currentAdmin })
      onSaved({ status: currentStatus })
    } catch (error) {
      setFormError(error.message || 'Could not save changes. Please try again.')
    } finally {
      setSavingChanges(false)
    }
  }

  const primaryActions = isDraftEligible
    ? [
        { label: 'Save as Draft', variant: 'outline', onClick: () => setDraftDialogOpen(true) },
        ...(isLastStep ? [{ label: 'Publish', onClick: handlePublish, loading: publishing }] : []),
      ]
    : [{ label: 'Save Changes', onClick: handleSaveChanges, loading: savingChanges }]

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
