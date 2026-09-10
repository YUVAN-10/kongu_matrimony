import { useFormContext } from 'react-hook-form'
import ProfileSection from '@/components/profiles/ProfileSection'
import { TextField, SelectField, StepGrid } from './FormFields'
import { DIET_OPTIONS, HABIT_OPTIONS } from '@/constants/profileOptions'

export default function LifestyleStep() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext()

  return (
    <ProfileSection title="Lifestyle">
      <StepGrid>
        <SelectField name="lifestyle.diet" label="Diet" control={control} options={DIET_OPTIONS} />
        <SelectField name="lifestyle.smoking" label="Smoking" control={control} options={HABIT_OPTIONS} />
        <SelectField name="lifestyle.drinking" label="Drinking" control={control} options={HABIT_OPTIONS} />
        <TextField name="lifestyle.hobbies" label="Hobbies" register={register} errors={errors} />
        <TextField
          name="lifestyle.interests"
          label="Interests"
          register={register}
          errors={errors}
          className="space-y-1.5 sm:col-span-2"
        />
      </StepGrid>
    </ProfileSection>
  )
}
