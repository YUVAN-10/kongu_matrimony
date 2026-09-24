import { useFormContext } from 'react-hook-form'
import ProfileSection from '@/components/profiles/ProfileSection'
import { TextAreaField } from './FormFields'

export default function AboutStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  return (
    <ProfileSection title="About">
      <div className="grid grid-cols-1 gap-4">
        <TextAreaField name="about.bio" label="About Me" register={register} errors={errors} rows={4} className="space-y-1.5" />
        <TextAreaField name="about.aboutFamily" label="About Family" register={register} errors={errors} rows={4} className="space-y-1.5" />
      </div>
    </ProfileSection>
  )
}
