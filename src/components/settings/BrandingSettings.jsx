import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { ImagePlus } from 'lucide-react'
import SettingsSectionCard from '@/components/settings/SettingsSectionCard'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { uploadSettingsAsset } from '@/services/settingsService'

export default function BrandingSettings() {
  const { register, setValue, watch } = useFormContext()
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const logoUrl = watch('branding.logoUrl')

  async function handleLogoUpload(event) {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      setUploadError('')
      const { url } = await uploadSettingsAsset(file, 'branding')
      setValue('branding.logoUrl', url, { shouldDirty: true })
    } catch (error) {
      setUploadError(error.message || 'Could not upload logo.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <SettingsSectionCard
      title="Branding"
      description="Control the visual identity used across the admin experience and sign-in experience."
      icon={ImagePlus}
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-dashed border-border bg-muted/40 p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Application Logo</p>
              <p className="text-sm text-muted-foreground">PNG, JPG, or WEBP. Recommended dimensions: 512x512 px.</p>
            </div>
            <label className="inline-flex cursor-pointer items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
              {uploading ? 'Uploading…' : 'Upload Logo'}
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="sr-only" />
            </label>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-border bg-background">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo preview" className="h-full w-full object-contain" />
              ) : (
                <span className="text-xs font-semibold text-muted-foreground">No logo</span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {logoUrl ? 'A new logo will be stored in Firebase Storage and referenced by URL.' : 'Upload a logo to begin.'}
            </div>
          </div>

          {uploadError ? <p className="mt-3 text-sm text-destructive">{uploadError}</p> : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="branding-faviconUrl">Favicon URL</Label>
            <Input id="branding-faviconUrl" {...register('branding.faviconUrl')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="branding-loginBackgroundUrl">Login Background URL</Label>
            <Input id="branding-loginBackgroundUrl" {...register('branding.loginBackgroundUrl')} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="branding-primaryColor">Primary Color</Label>
            <Input id="branding-primaryColor" type="color" className="h-11 cursor-pointer p-1" {...register('branding.primaryColor')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="branding-secondaryColor">Secondary Color</Label>
            <Input id="branding-secondaryColor" type="color" className="h-11 cursor-pointer p-1" {...register('branding.secondaryColor')} />
          </div>
        </div>
      </div>
    </SettingsSectionCard>
  )
}
