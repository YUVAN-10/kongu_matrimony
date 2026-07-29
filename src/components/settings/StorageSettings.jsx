import { useFormContext } from 'react-hook-form'
import { Database } from 'lucide-react'
import SettingsSectionCard from '@/components/settings/SettingsSectionCard'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function StorageSettings() {
  const { register } = useFormContext()

  return (
    <SettingsSectionCard
      title="Storage Settings"
      description="Control media limits and accepted file formats for uploaded assets."
      icon={Database}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="storage-maxImageSizeMB">Maximum Image Size (MB)</Label>
          <Input id="storage-maxImageSizeMB" type="number" min="1" step="0.1" {...register('storage.maxImageSizeMB', { valueAsNumber: true, min: { value: 1, message: 'Image size must be greater than 0.' } })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="storage-maxPhotosPerProfile">Maximum Photos Per Profile</Label>
          <Input id="storage-maxPhotosPerProfile" type="number" min="1" {...register('storage.maxPhotosPerProfile', { valueAsNumber: true, min: { value: 1, message: 'Photos per profile must be at least 1.' } })} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="storage-allowedImageFormats">Allowed Image Formats</Label>
        <Input id="storage-allowedImageFormats" {...register('storage.allowedImageFormats')} />
      </div>
    </SettingsSectionCard>
  )
}
