import { useFormContext } from 'react-hook-form'
import { Mail } from 'lucide-react'
import SettingsSectionCard from '@/components/settings/SettingsSectionCard'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function EmailSettings() {
  const { register } = useFormContext()

  return (
    <SettingsSectionCard
      title="Email Configuration"
      description="Configure SMTP and sender details for future mail delivery integration."
      icon={Mail}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email-smtpHost">SMTP Host</Label>
          <Input id="email-smtpHost" {...register('email.smtpHost')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email-smtpPort">SMTP Port</Label>
          <Input id="email-smtpPort" {...register('email.smtpPort')} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email-smtpUsername">SMTP Username</Label>
          <Input id="email-smtpUsername" {...register('email.smtpUsername')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email-smtpPassword">SMTP Password</Label>
          <Input id="email-smtpPassword" type="password" {...register('email.smtpPassword')} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email-senderName">Sender Name</Label>
          <Input id="email-senderName" {...register('email.senderName')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email-senderEmail">Sender Email</Label>
          <Input id="email-senderEmail" type="email" {...register('email.senderEmail')} />
        </div>
      </div>
    </SettingsSectionCard>
  )
}
