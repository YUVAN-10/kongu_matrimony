import { collection, query, where, orderBy, onSnapshot, doc, getCountFromServer, runTransaction, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase/firebase'
import { logActivity } from '@/services/activityLogService'
import { getProfileById } from '@/services/profileService'

const PROFILES_COLLECTION = 'profiles'

/**
 * New Profile Approvals — a brand-new client profile's FIRST review, distinct
 * from Profile Change Approvals (edits to an already-active profile, stored
 * separately in profileChangeRequests). This module only ever touches the
 * profiles/{profileId} document itself — draft -> pending_approval -> active
 * (or rejected), always the SAME document, never a second one. See
 * profileService.js for every other profiles/ operation (draft save,
 * publish, hide/restore, soft delete) — reused here, not duplicated.
 *
 * Client-side contract (no client app lives in this repo — see
 * profileChangeRequestService.js's equivalent note): when a client submits
 * their profile for the first time, or resubmits after a rejection, they
 * call resubmitProfile() below directly against Firestore, subject to the
 * ownership rules in firestore.rules' profiles block.
 */

function mapSnapshot(snapshot) {
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
}

/** Realtime feed of profiles awaiting their first approval. */
export function subscribeToPendingNewProfiles(onData, onError) {
  const pendingQuery = query(
    collection(db, PROFILES_COLLECTION),
    where('system.status', '==', 'pending_approval'),
    orderBy('system.submittedAt', 'desc')
  )
  return onSnapshot(pendingQuery, (snapshot) => onData(mapSnapshot(snapshot)), onError)
}

/** Realtime pending count — powers the sidebar badge and the dashboard card. */
export function subscribeToPendingNewProfileCount(onCount, onError) {
  const pendingQuery = query(collection(db, PROFILES_COLLECTION), where('system.status', '==', 'pending_approval'))
  return onSnapshot(pendingQuery, (snapshot) => onCount(snapshot.size), onError)
}

/** One-time aggregate count (server-side COUNT, no listener). */
export async function getPendingNewProfileCount() {
  const pendingQuery = query(collection(db, PROFILES_COLLECTION), where('system.status', '==', 'pending_approval'))
  const snapshot = await getCountFromServer(pendingQuery)
  return snapshot.data().count
}

/** Reused as-is from profileService.js — a pending-approval profile is still just a profiles/{profileId} document. */
export { getProfileById as getNewProfileById }

/**
 * Approves a first-time profile submission: pending_approval -> active, in
 * the SAME document (no second profile is ever created). Wrapped in a
 * transaction purely to guard against two admins approving/rejecting the
 * same profile at once — whichever commits second re-reads status and fails.
 */
export async function approveNewProfile(profileId, { admin }) {
  const profileRef = doc(db, PROFILES_COLLECTION, profileId)

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(profileRef)
    if (!snap.exists()) {
      throw new Error('This profile no longer exists.')
    }
    const profile = snap.data()
    if (profile.system?.status !== 'pending_approval') {
      throw new Error('This profile has already been reviewed.')
    }

    tx.update(profileRef, {
      'system.status': 'active',
      'system.approvedBy': admin?.uid || null,
      'system.approvedAt': serverTimestamp(),
      'system.updatedAt': serverTimestamp(),
    })
  })

  logActivity({
    action: 'new_profile_approved',
    module: 'Profiles',
    targetType: 'profile',
    targetId: profileId,
    description: `Approved new profile "${profileId}"`,
    newData: { status: 'active' },
    admin,
  })
}

/** Rejects a first-time profile submission. Status only — nothing about the profile's own field data is touched. */
export async function rejectNewProfile(profileId, { admin, rejectionReason }) {
  const trimmedReason = rejectionReason?.trim()
  if (!trimmedReason) {
    throw new Error('A rejection reason is required.')
  }

  const profileRef = doc(db, PROFILES_COLLECTION, profileId)

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(profileRef)
    if (!snap.exists()) {
      throw new Error('This profile no longer exists.')
    }
    const profile = snap.data()
    if (profile.system?.status !== 'pending_approval') {
      throw new Error('This profile has already been reviewed.')
    }

    tx.update(profileRef, {
      'system.status': 'rejected',
      'system.rejectionReason': trimmedReason,
      'system.rejectedBy': admin?.uid || null,
      'system.rejectedAt': serverTimestamp(),
      'system.updatedAt': serverTimestamp(),
    })
  })

  logActivity({
    action: 'new_profile_rejected',
    module: 'Profiles',
    targetType: 'profile',
    targetId: profileId,
    description: `Rejected new profile "${profileId}" — ${trimmedReason}`,
    newData: { status: 'rejected', rejectionReason: trimmedReason },
    admin,
  })
}

/**
 * Client-side: submits a profile for its first review (draft -> pending_
 * approval), or resubmits after a rejection (rejected -> pending_approval).
 * Same document throughout — never creates a new one. Fires the matching
 * activity action depending on which transition just happened, per the
 * module's log requirements (SUBMITTED vs RESUBMITTED are distinct events).
 */
export async function resubmitProfile(profileId, { submittedBy }) {
  const profileRef = doc(db, PROFILES_COLLECTION, profileId)

  const previousStatus = await runTransaction(db, async (tx) => {
    const snap = await tx.get(profileRef)
    if (!snap.exists()) {
      throw new Error('This profile no longer exists.')
    }
    const profile = snap.data()
    const currentStatus = profile.system?.status
    if (currentStatus !== 'draft' && currentStatus !== 'rejected') {
      throw new Error('Only a draft or rejected profile can be submitted for approval.')
    }

    tx.update(profileRef, {
      'system.status': 'pending_approval',
      'system.submittedAt': serverTimestamp(),
      'system.submittedBy': submittedBy,
      'system.createdSource': 'client',
      'system.updatedAt': serverTimestamp(),
    })

    return currentStatus
  })

  logActivity({
    action: previousStatus === 'rejected' ? 'new_profile_resubmitted' : 'new_profile_submitted',
    module: 'Profiles',
    targetType: 'profile',
    targetId: profileId,
    description:
      previousStatus === 'rejected'
        ? `Resubmitted profile "${profileId}" for review after rejection`
        : `Submitted new profile "${profileId}" for review`,
    newData: { status: 'pending_approval' },
    admin: { uid: submittedBy, name: 'Client' },
  })
}
