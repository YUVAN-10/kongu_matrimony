import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import ProfileSection from '@/components/profiles/ProfileSection'
import { TextField, SelectField, StepGrid } from './FormFields'
import { EDUCATION_OPTIONS, EMPLOYED_IN_OPTIONS } from '@/constants/profileOptions'
import { formatCurrency } from '@/utils/helpers'

export default function EducationOccupationStep() {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext()

  const monthlyIncome = watch('occupation.monthlyIncome')
  const annualIncome = Number(monthlyIncome || 0) * 12

  // Stored (not just displayed) so it's queryable later without recomputing
  // from monthly income every time — unlike age, a stated income figure
  // doesn't go stale the way a birthdate-derived age does.
  useEffect(() => {
    setValue('occupation.annualIncome', annualIncome, { shouldDirty: false })
  }, [annualIncome, setValue])

  return (
    <div className="space-y-6">
      <ProfileSection title="Education">
        <StepGrid>
          <SelectField
            name="education.highestQualification"
            label="Highest Qualification"
            control={control}
            options={EDUCATION_OPTIONS}
          />
          <TextField name="education.details" label="Education Details" register={register} errors={errors} />
        </StepGrid>
      </ProfileSection>

      <ProfileSection title="Occupation">
        <StepGrid>
          <TextField name="occupation.jobTitle" label="Occupation" register={register} errors={errors} />
          <SelectField
            name="occupation.employedIn"
            label="Employed In"
            control={control}
            options={EMPLOYED_IN_OPTIONS}
          />
          <TextField name="occupation.organization" label="Organization" register={register} errors={errors} />
          <TextField
            name="occupation.monthlyIncome"
            label="Monthly Income"
            type="number"
            register={register}
            errors={errors}
          />
          <div className="space-y-1.5">
            <p className="text-sm leading-none font-medium">Annual Income (auto-calculated)</p>
            <p className="flex h-9 items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
              {formatCurrency(annualIncome)}
            </p>
          </div>
        </StepGrid>
      </ProfileSection>
    </div>
  )
}
