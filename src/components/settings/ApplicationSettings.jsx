import { useFormContext } from 'react-hook-form'
import { PanelTop } from 'lucide-react'
import SettingsSectionCard from '@/components/settings/SettingsSectionCard'
import { Label } from '@/components/ui/label'

export default function ApplicationSettings() {
  const { register } = useFormContext()

  const featureToggles = [
    ['application.maintenanceMode', 'Maintenance Mode'],
    ['application.registrationEnabled', 'Registration Enabled'],
    ['application.allowUserProfileCreation', 'Allow User Profile Creation'],
    ['application.allowAdminProfileCreation', 'Allow Admin Profile Creation'],
    ['application.enableChat', 'Enable Chat'],
    ['application.enableHoroscope', 'Enable Horoscope'],
    ['application.enableContactDetails', 'Enable Contact Details'],
    ['application.enablePartnerPreference', 'Enable Partner Preference'],
  ]

  return (
    <SettingsSectionCard
      title="Application Features"
      description="Enable or disable feature flags used by the admin panel and client application."
      icon={PanelTop}
    >
      <div className="grid gap-3 md:grid-cols-2">
        {featureToggles.map(([name, label]) => (
          <div key={name} className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
            <input id={name} type="checkbox" className="h-4 w-4 rounded border-border accent-primary" {...register(name)} />
            <Label htmlFor={name} className="cursor-pointer">
              {label}
            </Label>
          </div>
        ))}
      </div>
    </SettingsSectionCard>
  )
}
