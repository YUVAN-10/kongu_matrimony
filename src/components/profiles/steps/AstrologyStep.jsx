import { useFormContext } from 'react-hook-form'
import ProfileSection from '@/components/profiles/ProfileSection'
import { TextField, SelectField, StepGrid } from './FormFields'
import { DOSHAM_OPTIONS } from '@/constants/profileOptions'

export default function AstrologyStep() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext()

  return (
    <ProfileSection title="Astrology" description="Optional — fill in whatever the family provides.">
      <StepGrid>
        <TextField name="astrology.birthTime" label="Birth Time" type="time" register={register} errors={errors} />
        <TextField name="astrology.birthPlace" label="Birth Place" register={register} errors={errors} />
        <TextField name="astrology.star" label="Star / Nakshatra" register={register} errors={errors} />
        <TextField name="astrology.raasi" label="Raasi / Moon Sign" register={register} errors={errors} />
        <TextField name="astrology.gothra" label="Gothra" register={register} errors={errors} />
        <SelectField name="astrology.dosham" label="Dosham" control={control} options={DOSHAM_OPTIONS} />
      </StepGrid>
    </ProfileSection>
  )
}
