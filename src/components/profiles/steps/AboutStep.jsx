import { useFormContext } from 'react-hook-form'
import ProfileSection from '@/components/profiles/ProfileSection'
import { TextAreaField } from './FormFields'

export default function AboutStep() {
  const { register } = useFormContext()

  return (
    <ProfileSection title="About & Expectation">
      <div className="grid grid-cols-1 gap-4">
        <TextAreaField name="about.aboutMe" label="About Me" register={register} rows={5} className="space-y-1.5" />
        <TextAreaField
          name="about.expectations"
          label="Expectations"
          register={register}
          rows={5}
          className="space-y-1.5"
        />
      </div>
    </ProfileSection>
  )
}
