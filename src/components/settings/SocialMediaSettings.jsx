import { useFormContext } from 'react-hook-form'
import { MessageCircle } from 'lucide-react'
import SettingsSectionCard from '@/components/settings/SettingsSectionCard'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SocialMediaSettings() {
  const { register } = useFormContext()

  return (
    <SettingsSectionCard
      title="Social Media"
      description="Provide links that can be surfaced across the application."
      icon={MessageCircle}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="socialMedia-facebook">Facebook</Label>
          <Input id="socialMedia-facebook" {...register('socialMedia.facebook')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="socialMedia-instagram">Instagram</Label>
          <Input id="socialMedia-instagram" {...register('socialMedia.instagram')} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="socialMedia-twitter">Twitter</Label>
          <Input id="socialMedia-twitter" {...register('socialMedia.twitter')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="socialMedia-linkedin">LinkedIn</Label>
          <Input id="socialMedia-linkedin" {...register('socialMedia.linkedin')} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="socialMedia-youtube">YouTube</Label>
        <Input id="socialMedia-youtube" {...register('socialMedia.youtube')} />
      </div>
    </SettingsSectionCard>
  )
}
