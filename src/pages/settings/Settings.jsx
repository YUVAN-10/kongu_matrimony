import { useEffect, useMemo, useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { AlertCircle, Building2, CheckCircle2, CircleDollarSign, Database, ShieldCheck, Sparkles, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import SettingsSaveBar from '@/components/settings/SettingsSaveBar'
import GeneralSettings from '@/components/settings/GeneralSettings'
import BrandingSettings from '@/components/settings/BrandingSettings'
import ContactSettings from '@/components/settings/ContactSettings'
import SocialMediaSettings from '@/components/settings/SocialMediaSettings'
import SubscriptionSettings from '@/components/settings/SubscriptionSettings'
import ApplicationSettings from '@/components/settings/ApplicationSettings'
import SecuritySettings from '@/components/settings/SecuritySettings'
import EmailSettings from '@/components/settings/EmailSettings'
import StorageSettings from '@/components/settings/StorageSettings'
import { SETTINGS_SECTIONS } from '@/constants/settingsOptions'
import { useAuth } from '@/hooks/useAuth'
import { useSettings } from '@/hooks/useSettings'

const SECTION_COMPONENTS = {
  general: GeneralSettings,
  branding: BrandingSettings,
  contact: ContactSettings,
  socialMedia: SocialMediaSettings,
  subscription: SubscriptionSettings,
  application: ApplicationSettings,
  security: SecuritySettings,
  email: EmailSettings,
  storage: StorageSettings,
}

function buildFormValues(settings) {
  return {
    general: settings?.general || {},
    branding: settings?.branding || {},
    contact: settings?.contact || {},
    socialMedia: settings?.socialMedia || {},
    subscription: settings?.subscription || {},
    application: settings?.application || {},
    security: settings?.security || {},
    email: settings?.email || {},
    storage: settings?.storage || {},
  }
}

export default function Settings() {
  const { currentAdmin } = useAuth()
  const { settings, loading, error, saving, saveSettings, restoreDefaults } = useSettings()
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  const form = useForm({
    defaultValues: buildFormValues(settings),
    mode: 'onChange',
  })

  const {
    reset,
    handleSubmit,
    formState: { isDirty },
  } = form

  useEffect(() => {
    reset(buildFormValues(settings))
  }, [reset, settings])

  const summaryItems = useMemo(
    () => [
      {
        label: 'Application Status',
        value: settings?.application?.maintenanceMode ? 'Maintenance' : 'Live',
        icon: Wrench,
      },
      {
        label: 'Maintenance Mode',
        value: settings?.application?.maintenanceMode ? 'Enabled' : 'Disabled',
        icon: ShieldCheck,
      },
      {
        label: 'Registration Status',
        value: settings?.application?.registrationEnabled ? 'Open' : 'Closed',
        icon: CheckCircle2,
      },
      {
        label: 'Current Theme',
        value: `${settings?.branding?.primaryColor || '#C62828'} / ${settings?.branding?.secondaryColor || '#F9A825'}`,
        icon: Sparkles,
      },
      {
        label: 'Storage Usage',
        value: 'Placeholder',
        icon: Database,
      },
    ],
    [settings],
  )


  async function onSubmit(values) {
    setFormError('')
    setFormSuccess('')

    try {
      const result = await saveSettings({ values, admin: currentAdmin })
      if (result?.saved) {
        reset(values)
        setFormSuccess('Settings updated successfully.')
      } else {
        setFormSuccess('No changes were detected.')
      }
    } catch (err) {
      setFormError(err?.message || 'Could not save settings. Please try again.')
    }
  }

  async function handleRestoreDefaults() {
    const confirmed = window.confirm('Restore all settings to their default values? This action cannot be undone.')
    if (!confirmed) return

    setFormError('')
    setFormSuccess('')

    try {
      const result = await restoreDefaults({ admin: currentAdmin })
      if (result?.saved) {
        setFormSuccess('Default settings restored successfully.')
      } else {
        setFormSuccess('No changes were detected.')
      }
    } catch (err) {
      setFormError(err?.message || 'Could not restore default settings.')
    }
  }

  function handleDiscard() {
    reset(buildFormValues(settings))
    setFormError('')
    setFormSuccess('Changes discarded.')
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage application-wide configuration and branding.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} className="border-border/70 shadow-sm">
              <CardHeader>
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <Skeleton className="h-80 w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage application-wide configuration and branding from one place.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-sm text-muted-foreground">
          <Building2 className="size-4 text-primary" aria-hidden="true" />
          {settings?.general?.appName || 'Kongu Matrimony'}
        </div>
      </div>

      {error ? (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}

      {formError ? (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{formError}</span>
        </div>
      ) : null}

      {formSuccess ? (
        <div role="status" className="flex items-start gap-2 rounded-lg border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{formSuccess}</span>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {summaryItems.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.label} className="border-border/70 bg-card/90 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className="size-4 text-primary" aria-hidden="true" />
                  {item.label}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-foreground">{item.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          <div className="space-y-4">
            {SETTINGS_SECTIONS.map((section) => {
              const Section = SECTION_COMPONENTS[section.key]
              if (!Section) return null

              return (
                <div key={section.key} id={section.key} className="scroll-mt-24">
                  <Section />
                </div>
              )
            })}
          </div>

          <SettingsSaveBar
            isDirty={isDirty}
            isSaving={saving}
            onSave={handleSubmit(onSubmit)}
            onDiscard={handleDiscard}
            onReset={handleRestoreDefaults}
          />
        </form>
      </FormProvider>
    </div>
  )
}
