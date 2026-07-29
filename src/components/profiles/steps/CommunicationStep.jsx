import { useFormContext } from 'react-hook-form'
import ProfileSection from '@/components/profiles/ProfileSection'
import { TextField, SelectField, StepGrid } from './FormFields'
import { CONTACT_METHOD_OPTIONS } from '@/constants/profileOptions'

export default function CommunicationStep() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext()

  return (
    <ProfileSection title="Communication">
      <StepGrid>
        <SelectField
          name="communication.preferredContactMethod"
          label="Preferred Contact Method"
          control={control}
          options={CONTACT_METHOD_OPTIONS}
        />
        <TextField
          name="communication.whatsappNumber"
          label="WhatsApp Number"
          register={register}
          errors={errors}
        />
        <TextField
          name="communication.alternateEmail"
          label="Alternate Email"
          type="email"
          register={register}
          errors={errors}
        />
        <TextField
          name="communication.bestTimeToContact"
          label="Best Time to Contact"
          register={register}
          errors={errors}
        />
      </StepGrid>
    </ProfileSection>
  )
}
