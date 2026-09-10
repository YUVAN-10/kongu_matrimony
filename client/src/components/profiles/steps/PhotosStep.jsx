import { useFormContext } from 'react-hook-form'
import ProfileSection from '@/components/profiles/ProfileSection'
import ProfilePhotoUpload from '@/components/profiles/ProfilePhotoUpload'

// profileId comes from ProfileForm.jsx as a prop (not form data) — it's
// generated up-front (create mode) or the route param (edit mode) so
// uploads have a stable Storage path even before the profile is saved.
export default function PhotosStep({ profileId }) {
  const { watch, setValue } = useFormContext()
  const mainPhoto = watch('photos.main')
  const gallery = watch('photos.gallery')

  return (
    <div className="space-y-6">
      <ProfileSection title="Main Profile Photo">
        <ProfilePhotoUpload
          profileId={profileId}
          folder="main"
          value={mainPhoto}
          onChange={(next) => setValue('photos.main', next, { shouldDirty: true })}
          label="Appears on the profile card and list."
        />
      </ProfileSection>

      <ProfileSection title="Gallery Images">
        <ProfilePhotoUpload
          profileId={profileId}
          folder="gallery"
          multiple
          value={gallery}
          onChange={(next) => setValue('photos.gallery', next, { shouldDirty: true })}
          label="Additional photos shown on the full profile."
        />
      </ProfileSection>
    </div>
  )
}
