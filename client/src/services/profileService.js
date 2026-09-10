import api from '@/lib/api'
import { createUserAccount } from '@/services/authService'
import { createUserDocument } from '@/services/userService'
import { removeUndefined } from '@/utils/removeUndefined'
import { logActivity } from '@/services/activityLogService'

export function generateProfileId() {
  return `prof_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
}

function normalizeSearch(str) {
  return String(str || '').replace(/\s+/g, ' ').trim().toLowerCase()
}

export function subscribeToProfilesPage({ filters, sortBy, pageSize, cursor, page = 1 }, onData, onError) {
  let isCancelled = false

  async function fetchProfiles() {
    try {
      const response = await api.get('/profiles', {
        ...filters,
        sortBy,
        pageSize,
        page,
        cursor,
      })

      const profiles = Array.isArray(response)
        ? response
        : (response?.profiles || response?.data || response?.items || [])
      const lastVisible = response?.lastVisible || (profiles.length > 0 ? profiles[profiles.length - 1]?.id : null)

      if (!isCancelled) {
        onData(profiles, lastVisible)
      }
    } catch (err) {
      if (!isCancelled && onError) onError(err)
    }
  }

  fetchProfiles()

  return () => {
    isCancelled = true
  }
}

export function subscribeToProfilesForSearch({ filters }, onData, onError) {
  let isCancelled = false

  async function fetchAll() {
    try {
      const response = await api.get('/profiles', {
        ...filters,
        limit: 1000,
        pageSize: 1000,
      })
      const profiles = Array.isArray(response)
        ? response
        : (response?.profiles || response?.data || response?.items || [])
      if (!isCancelled) onData(profiles)
    } catch (err) {
      if (!isCancelled && onError) onError(err)
    }
  }

  fetchAll()

  return () => {
    isCancelled = true
  }
}

export async function getProfilesCount(filters) {
  try {
    const response = await api.get('/profiles/count', filters)
    if (typeof response?.count === 'number') return response.count
    if (typeof response === 'number') return response
  } catch {
    const res = await api.get('/profiles', { ...filters, limit: 1 })
    return res?.total || res?.totalCount || (Array.isArray(res) ? res.length : 0)
  }
  return 0
}

export async function getProfileById(profileId) {
  const response = await api.get(`/profiles/${profileId}`)
  return response?.profile || response?.data || response
}

export async function getProfileByUserId(userId) {
  if (!userId) return null
  try {
    const response = await api.get(`/profiles/user/${userId}`)
    return response?.profile || response?.data || response
  } catch {
    const res = await api.get('/profiles', { userId, limit: 1 })
    const list = Array.isArray(res) ? res : (res?.profiles || res?.data || [])
    return list[0] || null
  }
}

export async function searchProfilesOnce(term) {
  const trimmed = normalizeSearch(term)
  if (!trimmed) return []

  try {
    const response = await api.get('/profiles/search', { term: trimmed, limit: 50 })
    return Array.isArray(response) ? response : (response?.profiles || response?.data || [])
  } catch {
    const res = await api.get('/profiles', { limit: 100 })
    const profiles = Array.isArray(res) ? res : (res?.profiles || res?.data || [])
    const searchWords = trimmed.split(' ')
    return profiles.filter((profile) => {
      const haystack = [
        profile.personal?.fullName,
        profile.personal?.mobileNumber,
        profile.personal?.email,
        profile.id,
      ]
        .map((field) => normalizeSearch(field))
        .join(' ')
      return searchWords.every((word) => haystack.includes(word))
    })
  }
}

export async function saveDraft(profileId, sections, { admin, isNew }) {
  const adminLabel = admin?.name || admin?.email || 'Admin'
  const now = new Date().toISOString()
  const payload = removeUndefined({
    ...sections,
    id: profileId,
    system: {
      ...sections.system,
      status: 'draft',
      draftSavedAt: now,
      updatedAt: now,
      ...(isNew && {
        createdBy: adminLabel,
        createdAt: now,
        subscriptionStatus: 'free',
        blocked: false,
      }),
    },
  })

  if (isNew) {
    await api.post('/profiles', payload).catch(async () => {
      await api.put(`/profiles/${profileId}`, payload)
    })
  } else {
    await api.put(`/profiles/${profileId}`, payload)
  }

  logActivity({
    action: isNew ? 'create' : 'update',
    module: 'Profiles',
    targetType: 'profile',
    targetId: profileId,
    description: `${isNew ? 'Created' : 'Updated'} profile draft "${sections.personal?.fullName || profileId}"`,
    admin,
  })
}

export async function publishProfile(profileId, sections, { admin, isNew }) {
  const adminLabel = admin?.name || admin?.email || 'Admin'
  const now = new Date().toISOString()
  const payload = removeUndefined({
    ...sections,
    id: profileId,
    system: {
      ...sections.system,
      status: 'active',
      publishedAt: now,
      updatedAt: now,
      ...(isNew && {
        createdBy: adminLabel,
        createdAt: now,
        subscriptionStatus: 'free',
        blocked: false,
      }),
    },
  })

  if (isNew) {
    await api.post('/profiles', payload).catch(async () => {
      await api.put(`/profiles/${profileId}`, payload)
    })
  } else {
    await api.put(`/profiles/${profileId}`, payload)
  }

  logActivity({
    action: 'publish',
    module: 'Profiles',
    targetType: 'profile',
    targetId: profileId,
    description: `${isNew ? 'Created and published' : 'Published'} profile "${sections.personal?.fullName || profileId}"`,
    admin,
  })
}

export async function updateProfile(profileId, sections, { admin } = {}) {
  const now = new Date().toISOString()
  const payload = removeUndefined({
    ...sections,
    system: { ...sections.system, updatedAt: now },
  })

  await api.put(`/profiles/${profileId}`, payload)

  logActivity({
    action: 'update',
    module: 'Profiles',
    targetType: 'profile',
    targetId: profileId,
    description: `Updated profile "${sections.personal?.fullName || profileId}"`,
    admin,
  })
}

export async function hideProfile(profileId, { admin } = {}) {
  const now = new Date().toISOString()
  const payload = {
    'system.status': 'hidden',
    'system.updatedAt': now,
    status: 'hidden',
    updatedAt: now,
  }

  await api.patch(`/profiles/${profileId}/hide`, payload).catch(async () => {
    await api.put(`/profiles/${profileId}`, payload)
  })

  logActivity({
    action: 'hide',
    module: 'Profiles',
    targetType: 'profile',
    targetId: profileId,
    description: 'Hid profile',
    newData: { status: 'hidden' },
    admin,
  })
}

export async function restoreProfile(profileId, { admin } = {}) {
  const now = new Date().toISOString()
  const payload = {
    'system.status': 'active',
    'system.updatedAt': now,
    'system.deletedAt': null,
    'system.deletedBy': null,
    status: 'active',
    updatedAt: now,
  }

  await api.patch(`/profiles/${profileId}/restore`, payload).catch(async () => {
    await api.put(`/profiles/${profileId}`, payload)
  })

  logActivity({
    action: 'restore',
    module: 'Profiles',
    targetType: 'profile',
    targetId: profileId,
    description: 'Restored profile',
    newData: { status: 'active' },
    admin,
  })
}

export async function softDeleteProfile(profileId, { admin }) {
  const now = new Date().toISOString()
  const payload = {
    'system.status': 'deleted',
    'system.deletedAt': now,
    'system.deletedBy': admin?.name || admin?.email || 'Admin',
    status: 'deleted',
    deletedAt: now,
  }

  await api.delete(`/profiles/${profileId}`).catch(async () => {
    await api.patch(`/profiles/${profileId}/soft-delete`, payload).catch(async () => {
      await api.put(`/profiles/${profileId}`, payload)
    })
  })

  logActivity({
    action: 'delete',
    module: 'Profiles',
    targetType: 'profile',
    targetId: profileId,
    description: 'Deleted profile (soft delete)',
    newData: { status: 'deleted' },
    admin,
  })
}

export async function createLinkedUser({ name, email, phone, tempPassword, gender, city, admin }) {
  const uid = await createUserAccount({ email, password: tempPassword, name, phone, gender, city })
  await createUserDocument(uid, { name, email, phone, gender, city, admin })

  const existingProfile = await getProfileByUserId(uid)
  if (existingProfile) {
    return { uid, profileId: existingProfile.id }
  }

  const profileId = generateProfileId()
  const adminLabel = admin?.name || admin?.email || 'Admin'
  const now = new Date().toISOString()

  const draftProfileData = {
    id: profileId,
    userId: uid,
    personal: {
      fullName: name,
      email: email,
      mobileNumber: phone,
      gender: gender,
    },
    address: {
      city: city || '',
    },
    system: {
      status: 'draft',
      userId: uid,
      createdBy: adminLabel,
      createdAt: now,
      draftSavedAt: now,
      updatedAt: now,
      subscriptionStatus: 'free',
      blocked: false,
    },
  }

  await api.post('/profiles', removeUndefined(draftProfileData)).catch(async () => {
    await api.put(`/profiles/${profileId}`, removeUndefined(draftProfileData))
  })

  logActivity({
    action: 'create',
    module: 'Profiles',
    targetType: 'profile',
    targetId: profileId,
    description: `Automatically created draft profile "${name}" for new user`,
    newData: { userId: uid, profileId, status: 'draft' },
    admin,
  })

  return { uid, profileId }
}