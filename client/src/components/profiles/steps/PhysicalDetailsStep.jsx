import { useFormContext } from 'react-hook-form'
import ProfileSection from '@/components/profiles/ProfileSection'
import { TextField, SelectField, StepGrid } from './FormFields'
import { BODY_TYPE_OPTIONS, COMPLEXION_OPTIONS, BLOOD_GROUP_OPTIONS, YES_NO_OPTIONS } from '@/constants/profileOptions'

export default function PhysicalDetailsStep() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext()

  return (
    <ProfileSection title="Physical Details">
      <StepGrid>
        <TextField name="physical.heightCm" label="Height (cm)" type="number" register={register} errors={errors} />
        <TextField name="physical.weightKg" label="Weight (kg)" type="number" register={register} errors={errors} />
        <SelectField name="physical.bodyType" label="Body Type" control={control} options={BODY_TYPE_OPTIONS} />
        <SelectField name="physical.complexion" label="Complexion" control={control} options={COMPLEXION_OPTIONS} />
        <SelectField name="physical.bloodGroup" label="Blood Group" control={control} options={BLOOD_GROUP_OPTIONS} />
        <SelectField
          name="physical.physicallyChallenged"
          label="Physically Challenged"
          control={control}
          options={YES_NO_OPTIONS}
        />
        <TextField
          name="physical.physicallyChallengedDetails"
          label="Details (if any)"
          register={register}
          errors={errors}
          className="space-y-1.5 sm:col-span-2"
        />
      </StepGrid>
    </ProfileSection>
  )
}
