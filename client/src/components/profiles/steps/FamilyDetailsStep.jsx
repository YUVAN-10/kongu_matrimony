import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import ProfileSection from '@/components/profiles/ProfileSection'
import { TextField, SelectField, StepGrid } from './FormFields'
import { FAMILY_TYPE_OPTIONS, FAMILY_STATUS_OPTIONS } from '@/constants/profileOptions'
import { formatCurrency } from '@/utils/helpers'

export default function FamilyDetailsStep() {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext()

  const familyMonthlyIncome = watch('family.familyMonthlyIncome')
  const familyAnnualIncome = Number(familyMonthlyIncome || 0) * 12

  useEffect(() => {
    setValue('family.familyAnnualIncome', familyAnnualIncome, { shouldDirty: false })
  }, [familyAnnualIncome, setValue])

  return (
    <ProfileSection title="Family Details">
      <StepGrid>
        <TextField name="family.fatherName" label="Father's Name" register={register} errors={errors} />
        <TextField name="family.fatherOccupation" label="Father's Occupation" register={register} errors={errors} />
        <TextField name="family.motherName" label="Mother's Name" register={register} errors={errors} />
        <TextField name="family.motherOccupation" label="Mother's Occupation" register={register} errors={errors} />
        <TextField name="family.brothers" label="Brothers" type="number" register={register} errors={errors} />
        <TextField name="family.sisters" label="Sisters" type="number" register={register} errors={errors} />
        <SelectField name="family.familyType" label="Family Type" control={control} options={FAMILY_TYPE_OPTIONS} />
        <SelectField
          name="family.familyStatus"
          label="Family Status"
          control={control}
          options={FAMILY_STATUS_OPTIONS}
        />
        <TextField
          name="family.familyMonthlyIncome"
          label="Family Monthly Income"
          type="number"
          register={register}
          errors={errors}
        />
        <div className="space-y-1.5">
          <p className="text-sm leading-none font-medium">Family Annual Income (auto-calculated)</p>
          <p className="flex h-9 items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
            {formatCurrency(familyAnnualIncome)}
          </p>
        </div>
      </StepGrid>
    </ProfileSection>
  )
}
