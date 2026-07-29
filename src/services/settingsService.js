import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, storage } from '@/firebase/firebase'
import { logActivity } from '@/services/activityLogService'
import { removeUndefined } from '@/utils/removeUndefined'
import { DEFAULT_SETTINGS, SETTINGS_SECTIONS } from '@/constants/settingsOptions'

export const SETTINGS_COLLECTION = 'settings'
export const SETTINGS_DOCUMENT_ID = 'app'

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && value.constructor === Object
}

function deepClone(value) {
  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item))
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, entryValue]) => [key, deepClone(entryValue)]))
  }

  return value
}

export function mergeSettingsWithDefaults(rawSettings = {}) {
  const merged = deepClone(DEFAULT_SETTINGS)
  const source = rawSettings && typeof rawSettings === 'object' ? rawSettings : {}

  for (const section of SETTINGS_SECTIONS) {
    const sectionKey = section.key
    const currentSection = isPlainObject(source[sectionKey]) ? source[sectionKey] : {}
    merged[sectionKey] = {
      ...merged[sectionKey],
      ...currentSection,
    }
  }

  return merged
}

function getChangedFieldPaths(nextValues, currentSettings) {
  const changes = {}
  const baseline = mergeSettingsWithDefaults(currentSettings || {})

  for (const section of SETTINGS_SECTIONS) {
    const sectionKey = section.key
    const nextSection = nextValues?.[sectionKey] || {}
    const currentSection = baseline[sectionKey] || {}
    const sectionChanges = {}

    for (const [fieldKey, nextValue] of Object.entries(nextSection)) {
      const currentValue = currentSection[fieldKey]
      const currentSerialized = JSON.stringify(currentValue)
      const nextSerialized = JSON.stringify(nextValue)

      if (currentSerialized !== nextSerialized) {
        sectionChanges[fieldKey] = nextValue
      }
    }

    if (Object.keys(sectionChanges).length > 0) {
      changes[sectionKey] = sectionChanges
    }
  }

  return changes
}

export function subscribeToSettings(onData, onError) {
  const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOCUMENT_ID)
  return onSnapshot(
    settingsRef,
    (snapshot) => {
      const data = snapshot.exists() ? snapshot.data() : {}
      onData(mergeSettingsWithDefaults(data))
    },
    onError,
  )
}

export async function uploadSettingsAsset(file, folder = 'branding') {
  if (!file) throw new Error('No file provided')

  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
  const path = `settings/${folder}/${Date.now()}-${safeName}`
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  const url = await getDownloadURL(storageRef)
  return { url, path }
}

export async function saveSettings({ values, currentSettings, admin, mode = 'update' }) {
  const changes = getChangedFieldPaths(values, currentSettings)
  if (Object.keys(changes).length === 0) {
    return { saved: false, changed: false }
  }

  const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOCUMENT_ID)
  const payload = removeUndefined({
    ...changes,
    updatedAt: serverTimestamp(),
    updatedBy: admin?.uid || null,
  })

  await setDoc(settingsRef, payload, { merge: true })

  await logActivity({
    action: mode === 'restore' ? 'restore_settings' : 'update_settings',
    module: 'settings',
    targetType: 'settings',
    targetId: SETTINGS_DOCUMENT_ID,
    description: mode === 'restore' ? 'Restored default settings' : 'Updated application settings',
    oldData: currentSettings || null,
    newData: mergeSettingsWithDefaults({ ...(currentSettings || {}), ...values }),
    admin,
  })

  return { saved: true, changed: true, changes: payload }
}

export async function restoreDefaultSettings({ currentSettings, admin }) {
  const defaults = mergeSettingsWithDefaults({})
  const changes = getChangedFieldPaths(defaults, currentSettings)

  if (Object.keys(changes).length === 0) {
    return { saved: false, changed: false }
  }

  return saveSettings({ values: defaults, currentSettings, admin, mode: 'restore' })
}
