import { useFormContext } from 'react-hook-form'
import { Phone } from 'lucide-react'
import SettingsSectionCard from '@/components/settings/SettingsSectionCard'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { EMAIL_REGEX, PHONE_REGEX } from '@/constants/settingsOptions'

export default function ContactSettings() {
  const { register, formState: { errors } } = useFormContext()

  return (
    <SettingsSectionCard
      title="Contact Details"
      description="Keep support and office information available for admin workflows and client-facing pages."
      icon={Phone}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-supportEmail">Support Email</Label>
          <Input
            id="contact-supportEmail"
            type="email"
            {...register('contact.supportEmail', {
              pattern: { value: EMAIL_REGEX, message: 'Enter a valid support email address.' },
            })}
          />
          {errors?.contact?.supportEmail ? <p className="text-sm text-destructive">{errors.contact.supportEmail.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-supportPhone">Support Phone</Label>
          <Input
            id="contact-supportPhone"
            {...register('contact.supportPhone', {
              pattern: { value: PHONE_REGEX, message: 'Enter a valid phone number.' },
            })}
          />
          {errors?.contact?.supportPhone ? <p className="text-sm text-destructive">{errors.contact.supportPhone.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-whatsappNumber">WhatsApp Number</Label>
          <Input id="contact-whatsappNumber" {...register('contact.whatsappNumber')} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-officeAddress">Office Address</Label>
        <Textarea id="contact-officeAddress" rows={4} {...register('contact.officeAddress')} />
      </div>
    </SettingsSectionCard>
  )
}
