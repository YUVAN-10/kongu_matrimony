import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  getCountFromServer,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/firebase/firebase'
import { createUserAccount } from '@/services/authService'
import { createUserDocument } from '@/services/userService'
import { removeUndefined } from '@/utils/removeUndefined'
import { logActivity } from '@/services/activityLogService'

const PROFILES_COLLECTION = 'profiles'

/** Reserves a Firestore document ID before the profile exists, so photo
 * uploads (which need a stable path) can happen during the form flow even
 * before the first Save as Draft. */
export function generateProfileId() {
  return doc(collection(db, PROFILES_COLLECTION)).id
}

function buildFilterConstraints(filters = {}) {
  const constraints = []

  if (filters.status) {
    constraints.push(where('system.status', '==', filters.status))
  } else {
    constraints.push(where('system.status', 'in', ['draft', 'active', 'hidden']))
  }

  if (filters.gender) constraints.push(where('personal.gender', '==', filters.gender))
  if (filters.city?.trim()) constraints.push(where('address.city', '==', filters.city.trim()))
  if (filters.occupation?.trim()) {
    constraints.push(where('occupation.jobTitle', '==', filters.occupation.trim()))
  }
  if (filters.subscription) {
    constraints.push(where('system.subscriptionStatus', '==', filters.subscription))
  }

  return constraints
}

function buildSortConstraint(sortBy) {
  switch (sortBy) {
    case 'oldest':
      return orderBy('system.createdAt', 'asc')
    case 'lastUpdated':
      return orderBy('system.updatedAt', 'desc')
    case 'name_asc':
      return orderBy('personal.fullName', 'asc')
    case 'name_desc':
      return orderBy('personal.fullName', 'desc')
    case 'newest':
    default:
      return orderBy('system.createdAt', 'desc')
  }
}

function mapSnapshot(snapshot) {
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
}

/** Real-time, server-side paginated profile list — see userService's
 * subscribeToUsersPage for the identical cursor-pagination pattern. */
export function subscribeToProfilesPage({ filters, sortBy, pageSize, cursor }, onData, onError) {
  const constraints = [
    ...buildFilterConstraints(filters),
    buildSortConstraint(sortBy),
    limit(pageSize),
  ]
  if (cursor) constraints.push(startAfter(cursor))

  const profilesQuery = query(collection(db, PROFILES_COLLECTION), ...constraints)

  return onSnapshot(
    profilesQuery,
    (snapshot) => {
      const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null
      onData(mapSnapshot(snapshot), lastVisible)
    },
    onError
  )
}

const SEARCH_FETCH_CAP = 1000

/** Realtime but capped + unpaginated — see userService's equivalent for why
 * (Firestore can't do multi-field substring search server-side). */
export function subscribeToProfilesForSearch({ filters }, onData, onError) {
  const constraints = [
    ...buildFilterConstraints(filters),
    orderBy('system.createdAt', 'desc'),
    limit(SEARCH_FETCH_CAP),
  ]
  const profilesQuery = query(collection(db, PROFILES_COLLECTION), ...constraints)
  return onSnapshot(profilesQuery, (snapshot) => onData(mapSnapshot(snapshot)), onError)
}

export async function getProfilesCount(filters) {
  const profilesQuery = query(collection(db, PROFILES_COLLECTION), ...buildFilterConstraints(filters))
  const snapshot = await getCountFromServer(profilesQuery)
  return snapshot.data().count
}

export async function getProfileById(profileId) {
  const snap = await getDoc(doc(db, PROFILES_COLLECTION, profileId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function getProfileByUserId(userId) {
  if (!userId) return null
  const q = query(collection(db, PROFILES_COLLECTION), where('userId', '==', userId), limit(1))
  const snapshot = await getDocs(q)
  if (snapshot.empty) {
    return null
  }
  const profileDoc = snapshot.docs[0]
  return { id: profileDoc.id, ...profileDoc.data() }
}

/**
 * One-time (non-realtime) capped search across name/phone/email, used by
 * Assign Subscription's profile picker — a lookup, not a live list. Mirrors
 * userService.searchUsersOnce exactly; profiles have no stored link back to
 * their user account, so the admin cross-references by matching name/phone
 * rather than a foreign key (see the module's explanation for why).
 */
const PROFILE_PICKER_SEARCH_CAP = 50

function normalizeSearch(str) {
  return String(str || '').replace(/\s+/g, ' ').trim().toLowerCase()
}

export async function searchProfilesOnce(term) {
  const trimmed = normalizeSearch(term)
  if (!trimmed) return []

  const searchWords = trimmed.split(' ')

  const profilesQuery = query(
    collection(db, PROFILES_COLLECTION),
    where('system.status', 'in', ['draft', 'active', 'hidden']),
    orderBy('system.createdAt', 'desc'),
    limit(PROFILE_PICKER_SEARCH_CAP)
  )
  const snapshot = await getDocs(profilesQuery)
  const profiles = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))

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

/**
 * Saves the form's current state as a Draft — no validation, callable from
 * any step with however much (or little) has been filled in. `sections` is
 * the RHF getValues() output, whose top-level keys (personal, physical, ...)
 * already match the Firestore document shape 1:1 by design.
 */
export async function saveDraft(profileId, sections, { admin, isNew }) {
  const adminLabel = admin?.name || admin?.email || 'Admin'
  const payload = {
    ...sections,
    system: {
      ...sections.system,
      status: 'draft',
      draftSavedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...(isNew && {
        createdBy: adminLabel,
        createdAt: serverTimestamp(),
        subscriptionStatus: 'free',
        blocked: false,
      }),
    },
  }
  await setDoc(doc(db, PROFILES_COLLECTION, profileId), removeUndefined(payload), { merge: true })

  logActivity({
    action: isNew ? 'create' : 'update',
    module: 'Profiles',
    targetType: 'profile',
    targetId: profileId,
    description: `${isNew ? 'Created' : 'Updated'} profile draft "${sections.personal?.fullName || profileId}"`,
    admin,
  })
}

/**
 * Publishes a profile — Draft -> Active (or the initial publish of a
 * brand-new, never-drafted profile). Caller is responsible for having
 * already validated the three mandatory fields before calling this.
 */
export async function publishProfile(profileId, sections, { admin, isNew }) {
  const adminLabel = admin?.name || admin?.email || 'Admin'
  const payload = {
    ...sections,
    system: {
      ...sections.system,
      status: 'active',
      publishedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...(isNew && {
        createdBy: adminLabel,
        createdAt: serverTimestamp(),
        subscriptionStatus: 'free',
        blocked: false,
      }),
    },
  }
  await setDoc(doc(db, PROFILES_COLLECTION, profileId), removeUndefined(payload), { merge: true })

  logActivity({
    action: 'publish',
    module: 'Profiles',
    targetType: 'profile',
    targetId: profileId,
    description: `${isNew ? 'Created and published' : 'Published'} profile "${sections.personal?.fullName || profileId}"`,
    admin,
  })
}

/** Persists edits to a profile that's already Active/Hidden — status is left untouched. */
export async function updateProfile(profileId, sections, { admin } = {}) {
  const payload = { ...sections, system: { ...sections.system, updatedAt: serverTimestamp() } }
  await setDoc(doc(db, PROFILES_COLLECTION, profileId), removeUndefined(payload), { merge: true })

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
  await updateDoc(doc(db, PROFILES_COLLECTION, profileId), {
    'system.status': 'hidden',
    'system.updatedAt': serverTimestamp(),
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

/** Restores a Hidden or soft-Deleted profile back to Active. */
export async function restoreProfile(profileId, { admin } = {}) {
  await updateDoc(doc(db, PROFILES_COLLECTION, profileId), {
    'system.status': 'active',
    'system.updatedAt': serverTimestamp(),
    'system.deletedAt': null,
    'system.deletedBy': null,
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

/** Soft delete only — the document is kept and marked deleted, never removed. */
export async function softDeleteProfile(profileId, { admin }) {
  await updateDoc(doc(db, PROFILES_COLLECTION, profileId), {
    'system.status': 'deleted',
    'system.deletedAt': serverTimestamp(),
    'system.deletedBy': admin?.name || admin?.email || 'Admin',
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

/**
 * Orchestrates the Add User flow: creates the Firebase Auth account, 
 * then the matching Firestore users/{uid} document, and AUTOMATICALLY
 * creates a draft profile linked to this user. Returns the new uid.
 */
export async function createLinkedUser({ name, email, phone, tempPassword, gender, city, admin }) {
  // 1. Create Firebase Auth user and get UID
  const uid = await createUserAccount({ email, password: tempPassword })
  
  // 2. Create users/{uid} document
  await createUserDocument(uid, { name, email, phone, gender, city, admin })
  
  // 3. Check if profile already exists for this user (idempotency check)
  const existingProfile = await getProfileByUserId(uid)

  if (existingProfile) {
    if (import.meta.env.DEV) {
      console.log(`[ProfileService] Existing profile found for user ${uid}: ${existingProfile.id}`)
    }
    return { uid, profileId: existingProfile.id }
  }

  // 4. No existing profile - create exactly one draft profile linked to this user
  const profileId = generateProfileId()
  const adminLabel = admin?.name || admin?.email || 'Admin'
  
  const draftProfileData = {
    userId: uid, // Link profile to user via UID
    personal: {
      fullName: name, // Copy user's name into profile
      email: email,
      mobileNumber: phone,
      gender: gender
    },
    address: {
      city: city || ''
    },
    system: {
      status: 'draft',
      userId: uid,
      createdBy: adminLabel,
      createdAt: serverTimestamp(),
      draftSavedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      subscriptionStatus: 'free',
      blocked: false
    }
  }
  
  await setDoc(doc(db, PROFILES_COLLECTION, profileId), removeUndefined(draftProfileData))

  if (import.meta.env.DEV) {
    console.log(`[ProfileService] Profile created: ${profileId}`)
  }
  logActivity({
    action: 'create',
    module: 'Profiles',
    targetType: 'profile',
    targetId: profileId,
    description: `Automatically created draft profile "${name}" for new user`,
    newData: { userId: uid, profileId, status: 'draft' },
    admin
  })
  
  return { uid, profileId }
}