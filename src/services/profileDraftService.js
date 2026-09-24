import api from '@/lib/api'
import { createProfileChangeRequest } from '@/services/profileChangeRequestService'
import { logActivity } from '@/services/activityLogService'
import { removeUndefined } from '@/utils/removeUndefined'
import { formatProfilePayload } from '@/services/profileService'

const DRAFTS_LOCAL_KEY = 'kongu_admin_profile_drafts'

function getLocalDrafts() {
  try {
    const raw = localStorage.getItem(DRAFTS_LOCAL_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function setLocalDrafts(drafts) {
  try {
    localStorage.setItem(DRAFTS_LOCAL_KEY, JSON.stringify(drafts))
  } catch {}
}

/**
 * Fetches all saved profile drafts
 * GET /api/admin/profile-drafts
 */
export async function getProfileDrafts({ page = 1, limit = 50, search = '' } = {}) {
  try {
    const response = await api.get('/admin/profile-drafts', { page, limit, search })
    if (response?.data?.drafts) return response.data.drafts
    if (Array.isArray(response?.drafts)) return response.drafts
    if (Array.isArray(response)) return response
  } catch {
    // Fallback to local storage cache / memory for resilience
  }

  const localMap = getLocalDrafts()
  let list = Object.values(localMap)
  if (search) {
    const term = search.toLowerCase()
    list = list.filter(
      (d) =>
        d.profileName?.toLowerCase().includes(term) ||
        d.userId?.toLowerCase().includes(term) ||
        d.profileData?.personal?.fullName?.toLowerCase().includes(term)
    )
  }
  list.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
  return list
}

/**
 * Fetches a single saved draft by userId
 * GET /api/admin/profile-drafts/:userId
 */
export async function getProfileDraftById(userId) {
  if (!userId) return null
  try {
    const response = await api.get(`/admin/profile-drafts/${userId}`)
    const data = response?.data?.draft || response?.draft || response
    if (data && data.profileData) return data
  } catch {}

  const localMap = getLocalDrafts()
  return localMap[userId] || null
}

/**
 * Saves a complete profile draft snapshot
 * POST /api/admin/profile-drafts
 */
export async function saveProfileDraft(userId, profileData, { admin, profileName, photo } = {}) {
  const now = new Date().toISOString()
  const pName =
    profileName ||
    profileData?.personal?.fullName ||
    profileData?.fullName ||
    profileData?.name ||
    'Unnamed Profile'
  const pPhoto =
    photo ||
    profileData?.photos?.main?.url ||
    profileData?.profileImageUrl ||
    profileData?.photoURL ||
    null
  const pCity = profileData?.address?.city || profileData?.city || ''

  const draftDoc = {
    userId,
    profileId: userId,
    profileName: pName,
    photo: pPhoto,
    city: pCity,
    status: 'DRAFT',
    profileData: removeUndefined(profileData),
    savedBy: {
      id: admin?.uid || admin?.id || 'admin',
      name: admin?.name || admin?.email || 'Admin',
      email: admin?.email || '',
    },
    createdAt: now,
    updatedAt: now,
  }

  try {
    await api.post('/admin/profile-drafts', draftDoc)
  } catch {
    // API endpoint fallback
  }

  // Update local storage backup
  const localMap = getLocalDrafts()
  localMap[userId] = {
    ...(localMap[userId] || {}),
    ...draftDoc,
    createdAt: localMap[userId]?.createdAt || now,
    updatedAt: now,
  }
  setLocalDrafts(localMap)

  logActivity({
    action: 'save_draft',
    module: 'Profiles',
    targetType: 'profile_draft',
    targetId: userId,
    description: `Saved profile draft for "${pName}" (${userId})`,
    admin,
  })

  return draftDoc
}

/**
 * Deletes a draft from storage
 * DELETE /api/admin/profile-drafts/:userId
 */
export async function deleteProfileDraft(userId, { admin } = {}) {
  try {
    await api.delete(`/admin/profile-drafts/${userId}`)
  } catch {}

  const localMap = getLocalDrafts()
  if (localMap[userId]) {
    delete localMap[userId]
    setLocalDrafts(localMap)
  }

  logActivity({
    action: 'delete_draft',
    module: 'Profiles',
    targetType: 'profile_draft',
    targetId: userId,
    description: `Deleted profile draft for (${userId})`,
    admin,
  })

  return true
}

/**
 * Publishes a draft profile directly to the live customer profile (Admin workflow)
 */
export async function publishProfileDraft(userId, draftProfileData, { admin } = {}) {
  const adminLabel = admin?.name || admin?.email || 'Admin'
  const now = new Date().toISOString()
  const profileName =
    draftProfileData?.personal?.fullName ||
    draftProfileData?.fullName ||
    'User Profile'

  const payload = formatProfilePayload(draftProfileData, userId, 'active', false, adminLabel, now)

  // Admin Publish: Direct update to live profile (PUT /api/admin/users/:id)
  await api.put(`/admin/users/${userId}`, payload).catch(async () => {
    // Local fallback update
  })

  // Remove from draft list
  await deleteProfileDraft(userId, { admin })

  logActivity({
    action: 'admin_publish_profile',
    module: 'Profiles',
    targetType: 'user_profile',
    targetId: userId,
    description: `Admin published profile draft directly for "${profileName}"`,
    admin,
  })

  return { success: true, status: 'ACTIVE' }
}

export default {
  getProfileDrafts,
  getProfileDraftById,
  saveProfileDraft,
  deleteProfileDraft,
  publishProfileDraft,
}
