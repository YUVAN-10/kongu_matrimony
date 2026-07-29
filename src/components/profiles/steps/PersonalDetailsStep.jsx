import { useFormContext } from 'react-hook-form'
import ProfileSection from '@/components/profiles/ProfileSection'
import { TextField, SelectField, RadioField, StepGrid } from './FormFields'
import { GENDER_OPTIONS, MARITAL_STATUS_OPTIONS, RELIGION_OPTIONS } from '@/constants/profileOptions'

// The only step with mandatory fields — Full Name, Gender, Mobile Number.
// Everything else in the whole 12-step form is optional.
export default function PersonalDetailsStep() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext()

  return (
    <ProfileSection title="Personal Details" description="Only Full Name, Gender, and Mobile Number are required.">
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
        <TextField name="personal.dob" label="Date of Birth" type="date" register={register} errors={errors} />
        <TextField
          name="personal.mobileNumber"
          label="Mobile Number"
          register={register}
          errors={errors}
          required
        />
        <TextField name="personal.alternatePhone" label="Alternate Phone" register={register} errors={errors} />
        <TextField name="personal.email" label="Email" type="email" register={register} errors={errors} />
        <SelectField
          name="personal.maritalStatus"
          label="Marital Status"
          control={control}
          options={MARITAL_STATUS_OPTIONS}
        />
        <SelectField name="personal.religion" label="Religion" control={control} options={RELIGION_OPTIONS} />
        <TextField name="personal.motherTongue" label="Mother Tongue" register={register} errors={errors} />
      </StepGrid>
    </ProfileSection>
  )
}
