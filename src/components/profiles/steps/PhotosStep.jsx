import { useFormContext } from 'react-hook-form'
import ProfileSection from '@/components/profiles/ProfileSection'
import ProfilePhotoUpload from '@/components/profiles/ProfilePhotoUpload'

// profileId comes from ProfileForm.jsx as a prop (not form data) — it's
// generated up-front (create mode) or the route param (edit mode) so
// uploads have a stable Storage path even before the profile is saved.
export default function PhotosStep({ profileId }) {
  const { watch, setValue } = useFormContext()
  const photos = watch('photos') || {}
  const mainPhoto = photos.profileImageUrl || photos.main || watch('profileImageUrl') || watch('photoURL')
  const gallery = photos.gallery || watch('gallery') || []

  return (
    <div className="space-y-6">
      <ProfileSection title="Main Profile Photo">
        <ProfilePhotoUpload
          profileId={profileId}
          folder="main"
          value={mainPhoto}
          onChange={(next) => {
            const photoObj = next ? (typeof next === 'string' ? { url: next, path: next } : next) : null
            const urlStr = photoObj ? photoObj.url : ''

            setValue('photos.main', photoObj, { shouldDirty: true, shouldValidate: true })
            setValue('photos.profileImageUrl', urlStr, { shouldDirty: true, shouldValidate: true })
            setValue('profileImageUrl', urlStr, { shouldDirty: true, shouldValidate: true })
            setValue('photoURL', urlStr, { shouldDirty: true, shouldValidate: true })
          }}
          label="Appears on the profile card and list."
        />
      </ProfileSection>

      <ProfileSection title="Gallery Images">
        <ProfilePhotoUpload
          profileId={profileId}
          folder="gallery"
          multiple
          value={gallery}
          onChange={(next) => {
            const list = Array.isArray(next) ? next : []
            setValue('photos.gallery', list, { shouldDirty: true, shouldValidate: true })
            setValue('gallery', list, { shouldDirty: true, shouldValidate: true })
          }}
          label="Additional photos shown on the full profile."
        />
      </ProfileSection>
    </div>
  )
}
