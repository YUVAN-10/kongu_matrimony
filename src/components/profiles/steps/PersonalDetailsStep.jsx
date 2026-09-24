import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import ProfileSection from '@/components/profiles/ProfileSection'
import DatePickerField from '@/components/profiles/DatePickerField'
import { TextField, SelectField, RadioField, StepGrid } from './FormFields'
import { GENDER_OPTIONS, MARITAL_STATUS_OPTIONS, RELIGION_OPTIONS } from '@/constants/profileOptions'
import { calculateAge } from '@/utils/helpers'

export default function PersonalDetailsStep() {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext()

  const dob = watch('personal.dob')
  const calculatedAge = dob ? calculateAge(dob) : ''

  useEffect(() => {
    setValue('personal.age', calculatedAge !== null && calculatedAge !== undefined ? calculatedAge : '', { shouldDirty: false })
  }, [calculatedAge, setValue])

  return (
    <ProfileSection title="Personal Details" description="Full Name, Gender, Date of Birth, Mobile Number, and City are required.">
      <StepGrid>
        <TextField name="personal.fullName" label="Full Name" register={register} errors={errors} required />
        <RadioField
          name="personal.gender"
          label="Gender"
          control={control}
          errors={errors}
          required
          options={GENDER_OPTIONS}
        />
        <DatePickerField
          name="personal.dob"
          label="Date of Birth"
          control={control}
          errors={errors}
          required
        />
        <TextField
          name="personal.age"
          label="Age (auto-calculated)"
          type="number"
          register={register}
          errors={errors}
          disabled
          readOnly
          placeholder="Calculated from DOB"
        />
        <TextField
          name="personal.mobile"
          label="Phone Number"
          maxLength={10}
          register={register}
          errors={errors}
          required
          rules={{
            pattern: {
              value: /^[0-9]{10}$/,
              message: 'Only 10 digits allowed.',
            },
          }}
          placeholder="10-digit phone number"
        />
        <TextField name="personal.email" label="Email" type="email" register={register} errors={errors} />
        <SelectField
          name="personal.maritalStatus"
          label="Marital Status"
          control={control}
          errors={errors}
          options={MARITAL_STATUS_OPTIONS}
        />
        <SelectField name="personal.religion" label="Religion" control={control} errors={errors} options={RELIGION_OPTIONS} />
        <TextField name="personal.caste" label="Caste" register={register} errors={errors} />
        <TextField name="personal.subsect" label="Sub Caste" register={register} errors={errors} />
        <TextField name="personal.motherTongue" label="Mother Tongue" register={register} errors={errors} />
      </StepGrid>
    </ProfileSection>
  )
}
