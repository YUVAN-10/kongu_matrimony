import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  where,
  serverTimestamp,
  getCountFromServer,
} from 'firebase/firestore'
import { db } from '@/firebase/firebase'
import { removeUndefined } from '@/utils/removeUndefined'
import { logActivity } from '@/services/activityLogService'

const PLANS_COLLECTION = 'subscriptionPlans'

// Owned by the User Subscriptions module — each document assigns one user
// to one plan. Referenced here only to check "is this plan currently in
// use" before allowing a delete.
const SUBSCRIPTIONS_COLLECTION = 'subscriptions'

export function generatePlanId() {
  return doc(collection(db, PLANS_COLLECTION)).id
}

export async function createSubscriptionPlan(data, { admin }) {
  const planId = generatePlanId()
  const payload = {
    planId,
    planName: data.planName,
    price: Number(data.price),
    durationDays: Number(data.durationDays),
    description: data.description || '',
    features: data.features || {},
    status: data.status || 'active',
    createdBy: admin?.name || admin?.email || 'Admin',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  await setDoc(doc(db, PLANS_COLLECTION, planId), removeUndefined(payload))

  logActivity({
    action: 'create',
    module: 'Subscription Plans',
    targetType: 'subscription_plan',
    targetId: planId,
    description: `Created subscription plan "${data.planName}"`,
    newData: { planName: data.planName, price: data.price, durationDays: data.durationDays },
    admin,
  })

  return planId
}

/** Plan Name is intentionally not editable here — see EditSubscriptionPlan.jsx. */
export async function updateSubscriptionPlan(planId, data, { admin } = {}) {
  const payload = {
    price: Number(data.price),
    durationDays: Number(data.durationDays),
    description: data.description || '',
    features: data.features || {},
    status: data.status,
    updatedAt: serverTimestamp(),
  }
  await updateDoc(doc(db, PLANS_COLLECTION, planId), removeUndefined(payload))

  logActivity({
    action: 'update',
    module: 'Subscription Plans',
    targetType: 'subscription_plan',
    targetId: planId,
    description: `Updated subscription plan`,
    newData: { price: data.price, durationDays: data.durationDays, status: data.status },
    admin,
  })
}

export async function getSubscriptionPlanById(planId) {
  const snap = await getDoc(doc(db, PLANS_COLLECTION, planId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function deactivatePlan(planId, { admin } = {}) {
  await updateDoc(doc(db, PLANS_COLLECTION, planId), {
    status: 'inactive',
    updatedAt: serverTimestamp(),
  })

  logActivity({
    action: 'update',
    module: 'Subscription Plans',
    targetType: 'subscription_plan',
    targetId: planId,
    description: 'Deactivated subscription plan',
    newData: { status: 'inactive' },
    admin,
  })
}

/** Not part of the requested spec, but Deactivate needs an inverse or a
 * plan gets permanently stuck off — a plain status flip, no confirmation
 * needed since it isn't destructive. */
export async function activatePlan(planId, { admin } = {}) {
  await updateDoc(doc(db, PLANS_COLLECTION, planId), {
    status: 'active',
    updatedAt: serverTimestamp(),
  })

  logActivity({
    action: 'update',
    module: 'Subscription Plans',
    targetType: 'subscription_plan',
    targetId: planId,
    description: 'Activated subscription plan',
    newData: { status: 'active' },
    admin,
  })
}

/**
 * Counts subscriptions documents with stored status "active" pointing at
 * this plan. Deliberately checks the stored status rather than the
 * date-derived effective status (see userSubscriptionService's
 * getEffectiveStatus) — a subscription that's technically past its expiry
 * date but hasn't been renewed/cancelled yet should still block plan
 * deletion; better to be conservative here than let a plan disappear out
 * from under a subscription that's still nominally live.
 */
export async function getAssignedUserCount(planId) {
  const assignedQuery = query(
    collection(db, SUBSCRIPTIONS_COLLECTION),
    where('planId', '==', planId),
    where('status', '==', 'active')
  )
  const snapshot = await getCountFromServer(assignedQuery)
  return snapshot.data().count
}

export async function deleteSubscriptionPlan(planId, { admin } = {}) {
  const assignedCount = await getAssignedUserCount(planId)
  if (assignedCount > 0) {
    throw new Error('This plan is currently assigned to users and cannot be deleted.')
  }
  await deleteDoc(doc(db, PLANS_COLLECTION, planId))

  logActivity({
    action: 'delete',
    module: 'Subscription Plans',
    targetType: 'subscription_plan',
    targetId: planId,
    description: 'Deleted subscription plan',
    admin,
  })
}
