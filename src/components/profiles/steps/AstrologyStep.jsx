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
    <div className="space-y-6">
      <ProfileSection
        title="Astrological Profile & Details"
        description="Optional — fill in birth and astrological details provided by the family. (Charts are on the next step)."
      >
        <StepGrid>
          <TextField name="astrology.timeOfBirth" label="Birth Time" type="time" register={register} errors={errors} />
          <TextField name="astrology.placeOfBirth" label="Birth Place" register={register} errors={errors} />
          <TextField name="astrology.star" label="Star / Nakshatra (நட்சத்திரம்)" register={register} errors={errors} />
          <TextField name="astrology.rasi" label="Raasi / Moon Sign (இராசி)" register={register} errors={errors} />
          <TextField name="astrology.lakuna" label="Lagnam (லக்னம்)" register={register} errors={errors} />
          <SelectField name="astrology.hasDosham" label="Dosham (தோஷம்)" control={control} options={DOSHAM_OPTIONS} />
          <TextField name="astrology.gothram" label="Gothra / Koottam (கோத்திரம் / கூட்டம்)" register={register} errors={errors} />
          <TextField name="astrology.kulaTheivaTemple" label="Kuladeivam (குலதெய்வம்)" register={register} errors={errors} />
        </StepGrid>
      </ProfileSection>
    </div>
  )
}
