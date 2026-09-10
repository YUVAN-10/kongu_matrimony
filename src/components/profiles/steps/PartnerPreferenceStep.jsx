import { useFormContext } from 'react-hook-form'
import ProfileSection from '@/components/profiles/ProfileSection'
import { TextField, TextAreaField, StepGrid } from './FormFields'

export default function PartnerPreferenceStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  return (
    <ProfileSection title="Partner Preference">
      <StepGrid>
        <TextField
          name="partnerPreference.ageFrom"
          label="Preferred Age From"
          type="number"
          register={register}
          errors={errors}
        />
        <TextField
          name="partnerPreference.ageTo"
          label="Preferred Age To"
          type="number"
          register={register}
          errors={errors}
        />
        <TextField
          name="partnerPreference.heightFrom"
          label="Preferred Height From (cm)"
          type="number"
          register={register}
          errors={errors}
        />
        <TextField
          name="partnerPreference.heightTo"
          label="Preferred Height To (cm)"
          type="number"
          register={register}
          errors={errors}
        />
        <TextField name="partnerPreference.religion" label="Preferred Religion" register={register} errors={errors} />
        <TextField
          name="partnerPreference.education"
          label="Preferred Education"
          register={register}
          errors={errors}
        />
        <TextField
          name="partnerPreference.occupation"
          label="Preferred Occupation"
          register={register}
          errors={errors}
        />
        <TextField name="partnerPreference.location" label="Preferred Location" register={register} errors={errors} />
        <TextAreaField
          name="partnerPreference.expectations"
          label="Other Expectations"
          register={register}
        />
      </StepGrid>
    </ProfileSection>
  )
}
