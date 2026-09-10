import { useFormContext } from 'react-hook-form'
import ProfileSection from '@/components/profiles/ProfileSection'
import { TextField, StepGrid } from './FormFields'

export default function AddressStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  return (
    <ProfileSection title="Address">
      <StepGrid>
        <TextField
          name="address.addressLine"
          label="Address Line"
          register={register}
          errors={errors}
          className="space-y-1.5 sm:col-span-2"
        />
        <TextField name="address.city" label="City" register={register} errors={errors} />
        <TextField name="address.district" label="District" register={register} errors={errors} />
        <TextField name="address.state" label="State" register={register} errors={errors} />
        <TextField name="address.country" label="Country" register={register} errors={errors} />
        <TextField name="address.pincode" label="Pincode" register={register} errors={errors} />
      </StepGrid>
    </ProfileSection>
  )
}
