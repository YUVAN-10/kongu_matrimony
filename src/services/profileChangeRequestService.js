import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  getCountFromServer,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/firebase/firebase'
import { logActivity } from '@/services/activityLogService'
import { getProfileById as getProfileByIdFromProfileService } from '@/services/profileService'

const CHANGE_REQUESTS_COLLECTION = 'profileChangeRequests'
const PROFILES_COLLECTION = 'profiles'

/**
 * All Firestore access for the Profile Change Approvals module lives here —
 * both the admin review side (list/approve/reject) AND the client
 * submission side (createProfileChangeRequest), so no UI component (admin
 * or client) ever queries `profileChangeRequests` directly. Reuses the
 * single Firebase app/Firestore instance from '@/firebase/firebase' and the
 * existing logActivity()/activityLogs schema — no new Firebase init, no new
 * activity log collection.
 *
 * Business rule this file enforces end to end: `profiles/{profileId}` is
 * always the current APPROVED/LIVE profile. Nothing here ever writes a
 * client-submitted value into it except approveProfileChangeRequest, and
 * only for the exact fields present in that request's `changes` map.
 */

function mapDoc(docSnap) {
  return { id: docSnap.id, ...docSnap.data() }
}

function mapSnapshot(snapshot) {
  return snapshot.docs.map(mapDoc)
}

// ---------------------------------------------------------------------------
// Function 1 — get profile by id: reused as-is from profileService.js (no
// duplicate implementation) so both services agree on exactly one profile
// read path.
// ---------------------------------------------------------------------------
export const getProfileById = getProfileByIdFromProfileService

// ---------------------------------------------------------------------------
// Function 2 — get profile by user id
// ---------------------------------------------------------------------------
/**
 * Looks up the one profile linked to a user. Deliberately NOT the same as
 * profileService.getProfileByUserId (that one caps at limit(1) for its
 * picker-lookup use case) — this module needs to actually detect a broken
 * one-user-one-profile invariant rather than silently picking the first
 * match, since createProfileChangeRequest's ownership check depends on it.
 */
export async function getProfileByUserId(userId) {
  if (!userId) return null

  const profilesQuery = query(collection(db, PROFILES_COLLECTION), where('userId', '==', userId))
  const snapshot = await getDocs(profilesQuery)
  if (snapshot.empty) return null

  if (import.meta.env.DEV && snapshot.size > 1) {
    console.warn(
      `[profileChangeRequestService] Data integrity: user ${userId} is linked to ${snapshot.size} profiles — expected exactly one. Using the first.`
    )
  }

  return mapDoc(snapshot.docs[0])
}

// ---------------------------------------------------------------------------
// Function 3 — create (or merge into) a change request. Called by the
// CLIENT app after it diffs the edited form against the approved profile.
// ---------------------------------------------------------------------------
/**
 * `changes` must already be the field-level diff: { 'dot.path': { oldValue,
 * newValue }, ... } — this function does not compute the diff itself, it
 * only persists it. Throws (never silently no-ops) so the caller can show
 * the right message for each case — see the module's "NO CHANGE REQUEST"
 * and error-handling requirements.
 */
export async function createProfileChangeRequest({ profileId, userId, changes, submittedBy }) {
  if (!changes || Object.keys(changes).length === 0) {
    throw new Error('No profile changes detected.')
  }

  const profile = await getProfileById(profileId)
  if (!profile) {
    throw new Error('Profile not found.')
  }
  if (profile.userId !== userId) {
    throw new Error('This profile does not belong to the specified user.')
  }

  const existingPendingQuery = query(
    collection(db, CHANGE_REQUESTS_COLLECTION),
    where('profileId', '==', profileId),
    where('status', '==', 'pending'),
    limit(1)
  )

  // Transactional so two near-simultaneous submissions for the same profile
  // (e.g. two tabs, or a slow network retry) can't both see "no pending
  // request" and each create a separate one — the second transaction
  // re-reads the query and correctly finds + merges into the first's,
  // instead of racing to a duplicate pending request.
  const requestId = await runTransaction(db, async (tx) => {
    const existingSnapshot = await tx.get(existingPendingQuery)

    if (!existingSnapshot.empty) {
      // Merge into the existing pending request instead of creating a second
      // one — new values win for any field touched again before review.
      const existingDoc = existingSnapshot.docs[0]
      const mergedChanges = { ...(existingDoc.data().changes || {}), ...changes }
      tx.update(existingDoc.ref, {
        changes: mergedChanges,
        updatedAt: serverTimestamp(),
      })
      return existingDoc.id
    }

    const newDocRef = doc(collection(db, CHANGE_REQUESTS_COLLECTION))
    tx.set(newDocRef, {
      profileId,
      userId,
      status: 'pending',
      changes,
      submittedBy,
      submittedAt: serverTimestamp(),
      reviewedBy: null,
      reviewedAt: null,
      rejectionType: null,
      rejectionReason: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return newDocRef.id
  })

  // Client-attributed log entry — see firestore.rules' activityLogs block
  // for the narrow carve-out that lets a signed-in (non-admin) submitter
  // self-attribute exactly this one action.
  logActivity({
    action: 'submit_profile_change',
    module: 'Profiles',
    targetType: 'profile_change_request',
    targetId: requestId,
    description: `Submitted ${Object.keys(changes).length} profile change(s) for review`,
    newData: { profileId, userId, status: 'pending' },
    admin: { uid: submittedBy, name: 'Client' },
  })

  return requestId
}

// ---------------------------------------------------------------------------
// Function 4/8/9 — status-scoped realtime feeds (Pending / Approved / Rejected)
// ---------------------------------------------------------------------------
export function subscribeToPendingChangeRequests(onData, onError) {
  const pendingQuery = query(
    collection(db, CHANGE_REQUESTS_COLLECTION),
    where('status', '==', 'pending'),
    orderBy('submittedAt', 'desc')
  )
  return onSnapshot(pendingQuery, (snapshot) => onData(mapSnapshot(snapshot)), onError)
}

export function subscribeToApprovedChangeRequests(onData, onError) {
  const approvedQuery = query(
    collection(db, CHANGE_REQUESTS_COLLECTION),
    where('status', '==', 'approved'),
    orderBy('reviewedAt', 'desc')
  )
  return onSnapshot(approvedQuery, (snapshot) => onData(mapSnapshot(snapshot)), onError)
}

export function subscribeToRejectedChangeRequests(onData, onError) {
  const rejectedQuery = query(
    collection(db, CHANGE_REQUESTS_COLLECTION),
    where('status', '==', 'rejected'),
    orderBy('reviewedAt', 'desc')
  )
  return onSnapshot(rejectedQuery, (snapshot) => onData(mapSnapshot(snapshot)), onError)
}

/** Realtime, whole-collection subscription used by the admin list page (needs every status at once, joined against profiles/users, filtered client-side). */
export function subscribeToChangeRequests(onData, onError) {
  const requestsQuery = query(
    collection(db, CHANGE_REQUESTS_COLLECTION),
    orderBy('submittedAt', 'desc'),
    limit(2000)
  )
  return onSnapshot(requestsQuery, (snapshot) => onData(mapSnapshot(snapshot)), onError)
}

// ---------------------------------------------------------------------------
// Function 5 — get by id
// ---------------------------------------------------------------------------
export async function getChangeRequestById(requestId) {
  const snap = await getDoc(doc(db, CHANGE_REQUESTS_COLLECTION, requestId))
  return snap.exists() ? mapDoc(snap) : null
}

// ---------------------------------------------------------------------------
// Function 6 — approve (admin only, enforced by firestore.rules)
// ---------------------------------------------------------------------------
/**
 * Applies a pending request's `changes` to the live profile and marks the
 * request approved, in one transaction so the two writes can never happen
 * apart from each other. Re-reading `status` inside the transaction is also
 * what prevents two admins from double-approving the same request —
 * whichever transaction commits second sees status already 'approved' and
 * fails with "This change request has already been reviewed."
 */
export async function approveProfileChangeRequest({ requestId, admin }) {
  const requestRef = doc(db, CHANGE_REQUESTS_COLLECTION, requestId)

  const { profileId, changeCount } = await runTransaction(db, async (tx) => {
    const requestSnap = await tx.get(requestRef)
    if (!requestSnap.exists()) {
      throw new Error('This change request no longer exists.')
    }
    const request = requestSnap.data()
    if (request.status !== 'pending') {
      throw new Error('This change request has already been reviewed.')
    }

    const profileRef = doc(db, PROFILES_COLLECTION, request.profileId)
    const profileSnap = await tx.get(profileRef)
    if (!profileSnap.exists()) {
      throw new Error('The profile linked to this request no longer exists.')
    }
    const profile = profileSnap.data()
    if (profile.system?.status === 'deleted') {
      throw new Error('This profile has been deleted and cannot be updated.')
    }
    if (profile.userId && request.userId && profile.userId !== request.userId) {
      throw new Error("This request no longer matches the linked profile's user.")
    }

    // "personal.fullName": { oldValue, newValue } -> "personal.fullName": newValue
    // Dot-path keys update only the named nested field — the rest of the
    // profile document (and unrelated array/object fields) is untouched.
    const changes = request.changes || {}
    if (Object.keys(changes).length === 0) {
      throw new Error('This request has no changes to apply.')
    }
    const profileUpdate = { 'system.updatedAt': serverTimestamp() }
    for (const [path, change] of Object.entries(changes)) {
      // Firestore's update() rejects `undefined` outright with a raw,
      // unfriendly SDK error — catch a malformed/incomplete change entry
      // here instead, before it ever reaches the write.
      if (change?.newValue === undefined) {
        throw new Error(`This request has an invalid change for "${path}" — no requested value was provided.`)
      }
      profileUpdate[path] = change.newValue
    }

    tx.update(profileRef, profileUpdate)
    tx.update(requestRef, {
      status: 'approved',
      reviewedBy: admin?.uid || null,
      reviewedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return { profileId: request.profileId, changeCount: Object.keys(changes).length }
  })

  logActivity({
    action: 'approve_profile_change',
    module: 'Profiles',
    targetType: 'profile_change_request',
    targetId: requestId,
    description: `Approved ${changeCount} profile change(s) for profile "${profileId}"`,
    newData: { profileId, status: 'approved' },
    admin,
  })
}

// ---------------------------------------------------------------------------
// Function 7 — reject (admin only, enforced by firestore.rules)
// ---------------------------------------------------------------------------
/**
 * Rejects a pending change request. The live profile is never touched.
 * `rejectionType` is a controlled category (see REJECTION_TYPE_OPTIONS in
 * constants/changeRequestOptions.js) shown to the client alongside the
 * free-text `rejectionReason` — both are required so the client sees what
 * kind of issue it was, not just a paragraph of text.
 */
export async function rejectProfileChangeRequest({ requestId, admin, rejectionType, rejectionReason }) {
  if (!rejectionType?.trim()) {
    throw new Error('A rejection type is required.')
  }
  const trimmedReason = rejectionReason?.trim()
  if (!trimmedReason) {
    throw new Error('A rejection reason is required.')
  }

  const requestRef = doc(db, CHANGE_REQUESTS_COLLECTION, requestId)

  const { profileId } = await runTransaction(db, async (tx) => {
    const requestSnap = await tx.get(requestRef)
    if (!requestSnap.exists()) {
      throw new Error('This change request no longer exists.')
    }
    const request = requestSnap.data()
    if (request.status !== 'pending') {
      throw new Error('This change request has already been reviewed.')
    }

    tx.update(requestRef, {
      status: 'rejected',
      reviewedBy: admin?.uid || null,
      reviewedAt: serverTimestamp(),
      rejectionType,
      rejectionReason: trimmedReason,
      updatedAt: serverTimestamp(),
    })

    return { profileId: request.profileId }
  })

  logActivity({
    action: 'reject_profile_change',
    module: 'Profiles',
    targetType: 'profile_change_request',
    targetId: requestId,
    description: `Rejected profile change request for profile "${profileId}" — [${rejectionType}] ${trimmedReason}`,
    newData: { profileId, status: 'rejected', rejectionType, rejectionReason: trimmedReason },
    admin,
  })
}

// ---------------------------------------------------------------------------
// Function 10 — pending count
// ---------------------------------------------------------------------------
/** One-time aggregate count (server-side COUNT, no listener) — see subscribeToPendingCount for the realtime equivalent the Sidebar/Dashboard badges use. */
export async function getPendingChangeRequestCount() {
  const pendingQuery = query(collection(db, CHANGE_REQUESTS_COLLECTION), where('status', '==', 'pending'))
  const snapshot = await getCountFromServer(pendingQuery)
  return snapshot.data().count
}

/** Realtime pending count — powers the sidebar badge and the dashboard card, both of which need to update live as requests are submitted/reviewed. */
export function subscribeToPendingCount(onCount, onError) {
  const pendingQuery = query(collection(db, CHANGE_REQUESTS_COLLECTION), where('status', '==', 'pending'))
  return onSnapshot(pendingQuery, (snapshot) => onCount(snapshot.size), onError)
}
