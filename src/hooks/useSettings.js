import { useEffect, useMemo, useState } from 'react'
import { subscribeToSettings, saveSettings, restoreDefaultSettings } from '@/services/settingsService'
import { DEFAULT_SETTINGS } from '@/constants/settingsOptions'
import { mergeSettingsWithDefaults } from '@/services/settingsService'

export function useSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribeToSettings(
      (nextSettings) => {
        setSettings(mergeSettingsWithDefaults(nextSettings))
        setLoading(false)
        setError(null)
      },
      (nextError) => {
        setError(nextError?.message || 'Unable to load settings.')
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [])

  const normalizedSettings = useMemo(() => mergeSettingsWithDefaults(settings), [settings])

  async function handleSave({ values, admin }) {
    setSaving(true)
    try {
      return await saveSettings({ values, currentSettings: normalizedSettings, admin })
    } finally {
      setSaving(false)
    }
  }

  async function handleRestoreDefaults({ admin }) {
    setSaving(true)
    try {
      return await restoreDefaultSettings({ currentSettings: normalizedSettings, admin })
    } finally {
      setSaving(false)
    }
  }

  return {
    settings: normalizedSettings,
    loading,
    error,
    saving,
    saveSettings: handleSave,
    restoreDefaults: handleRestoreDefaults,
  }
}
