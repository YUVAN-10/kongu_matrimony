import { useFormContext } from 'react-hook-form'
import { ShieldCheck } from 'lucide-react'
import SettingsSectionCard from '@/components/settings/SettingsSectionCard'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SecuritySettings() {
  const { register } = useFormContext()

  return (
    <SettingsSectionCard
      title="Security Settings"
      description="Set authentication policies and session behavior for the platform."
      icon={ShieldCheck}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="security-maxLoginAttempts">Maximum Login Attempts</Label>
          <Input id="security-maxLoginAttempts" type="number" min="1" {...register('security.maxLoginAttempts', { valueAsNumber: true })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="security-passwordMinLength">Password Length</Label>
          <Input id="security-passwordMinLength" type="number" min="1" {...register('security.passwordMinLength', { valueAsNumber: true })} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="security-sessionTimeoutMinutes">Session Timeout (Minutes)</Label>
          <Input id="security-sessionTimeoutMinutes" type="number" min="1" {...register('security.sessionTimeoutMinutes', { valueAsNumber: true })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="security-rememberMeEnabled">Remember Me</Label>
          <select id="security-rememberMeEnabled" className="h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('security.rememberMeEnabled')}>
            <option value={true}>Enabled</option>
            <option value={false}>Disabled</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
        <input id="security-twoFactorEnabled" type="checkbox" className="h-4 w-4 rounded border-border accent-primary" {...register('security.twoFactorEnabled')} />
        <Label htmlFor="security-twoFactorEnabled" className="cursor-pointer">
          Enable Two-Factor Authentication (future ready)
        </Label>
      </div>
    </SettingsSectionCard>
  )
}
