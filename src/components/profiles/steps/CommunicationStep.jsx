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
        <TextField
          name="communication.whatsappNumber"
          label="WhatsApp Number"
          maxLength={10}
          register={register}
          errors={errors}
          rules={{
            pattern: {
              value: /^[0-9]{10}$/,
              message: 'Only 10 digits allowed.',
            },
          }}
          placeholder="10-digit WhatsApp number"
        />
        <TextField
          name="communication.alternateMobile"
          label="Alternate Phone Number"
          maxLength={10}
          register={register}
          errors={errors}
          rules={{
            pattern: {
              value: /^[0-9]{10}$/,
              message: 'Only 10 digits allowed.',
            },
          }}
          placeholder="10-digit alternate phone number"
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
