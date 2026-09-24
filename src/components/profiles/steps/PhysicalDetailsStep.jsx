import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import ProfileSection from '@/components/profiles/ProfileSection'
import { TextField, SelectField, StepGrid } from './FormFields'
import { BODY_TYPE_OPTIONS, COMPLEXION_OPTIONS, BLOOD_GROUP_OPTIONS, YES_NO_OPTIONS } from '@/constants/profileOptions'

export default function PhysicalDetailsStep() {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext()

  const isPhysicallyChallenged = watch('physical.isPhysicallyChallenged')
  const isYes = isPhysicallyChallenged === 'Yes' || isPhysicallyChallenged === true || isPhysicallyChallenged === 'yes'

  useEffect(() => {
    if (!isYes) {
      setValue('physical.disabilityDetails', '', { shouldDirty: false })
    }
  }, [isYes, setValue])

  return (
    <ProfileSection title="Physical Details">
      <StepGrid>
        <TextField name="physical.heightCm" label="Height (cm)" type="number" register={register} errors={errors} />
        <TextField name="physical.weightKg" label="Weight (kg)" type="number" register={register} errors={errors} />
        <SelectField name="physical.bodyType" label="Body Type" control={control} errors={errors} options={BODY_TYPE_OPTIONS} />
        <SelectField name="physical.complexion" label="Complexion" control={control} errors={errors} options={COMPLEXION_OPTIONS} />
        <SelectField name="physical.bloodGroup" label="Blood Group" control={control} errors={errors} options={BLOOD_GROUP_OPTIONS} />
        <SelectField
          name="physical.isPhysicallyChallenged"
          label="Physically Challenged"
          control={control}
          errors={errors}
          options={YES_NO_OPTIONS}
        />
        {isYes && (
          <TextField
            name="physical.disabilityDetails"
            label="Physical Challenge Details"
            register={register}
            errors={errors}
            required
            className="space-y-1.5 sm:col-span-2"
            placeholder="Describe the physical challenge details"
          />
        )}
      </StepGrid>
    </ProfileSection>
  )
}
