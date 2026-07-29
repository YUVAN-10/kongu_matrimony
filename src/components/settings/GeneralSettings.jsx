import { useFormContext } from 'react-hook-form'
import { Globe2 } from 'lucide-react'
import SettingsSectionCard from '@/components/settings/SettingsSectionCard'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function GeneralSettings() {
  const { register } = useFormContext()

  return (
    <SettingsSectionCard
      title="General Settings"
      description="Define the core identity and regional defaults for the application."
      icon={Globe2}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="general-appName">Application Name</Label>
          <Input id="general-appName" {...register('general.appName')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="general-tagline">Application Tagline</Label>
          <Input id="general-tagline" {...register('general.tagline')} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="general-description">Application Description</Label>
        <Textarea id="general-description" rows={4} {...register('general.description')} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="general-copyright">Copyright</Label>
          <Input id="general-copyright" {...register('general.copyright')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="general-defaultLanguage">Default Language</Label>
          <select id="general-defaultLanguage" className="h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('general.defaultLanguage')}>
            <option value="English">English</option>
            <option value="Tamil">Tamil</option>
            <option value="Hindi">Hindi</option>
            <option value="Telugu">Telugu</option>
            <option value="Kannada">Kannada</option>
            <option value="Malayalam">Malayalam</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="general-timezone">Timezone</Label>
          <select id="general-timezone" className="h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('general.timezone')}>
            <option value="Asia/Kolkata">Asia/Kolkata</option>
            <option value="Asia/Dubai">Asia/Dubai</option>
            <option value="Asia/Singapore">Asia/Singapore</option>
            <option value="Europe/London">Europe/London</option>
            <option value="America/New_York">America/New_York</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="general-currency">Currency</Label>
          <select id="general-currency" className="h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('general.currency')}>
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="AED">AED (د.إ)</option>
            <option value="SGD">SGD ($)</option>
          </select>
        </div>
      </div>
    </SettingsSectionCard>
  )
}
