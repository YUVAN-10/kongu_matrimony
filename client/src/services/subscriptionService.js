import api from '@/lib/api'
import { removeUndefined } from '@/utils/removeUndefined'
import { logActivity } from '@/services/activityLogService'

export function generatePlanId() {
  return `plan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
}

export async function createSubscriptionPlan(data, { admin }) {
  const planId = generatePlanId()
  const now = new Date().toISOString()
  const payload = removeUndefined({
    id: planId,
    planId,
    planName: data.planName,
    price: Number(data.price),
    durationDays: Number(data.durationDays),
    description: data.description || '',
    features: data.features || {},
    status: data.status || 'active',
    createdBy: admin?.name || admin?.email || 'Admin',
    createdAt: now,
    updatedAt: now,
  })

  await api.post('/subscription-plans', payload)

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

export async function updateSubscriptionPlan(planId, data, { admin } = {}) {
  const now = new Date().toISOString()
  const payload = removeUndefined({
    price: Number(data.price),
    durationDays: Number(data.durationDays),
    description: data.description || '',
    features: data.features || {},
    status: data.status,
    updatedAt: now,
  })

  await api.put(`/subscription-plans/${planId}`, payload)

  logActivity({
    action: 'update',
    module: 'Subscription Plans',
    targetType: 'subscription_plan',
    targetId: planId,
    description: 'Updated subscription plan',
    newData: { price: data.price, durationDays: data.durationDays, status: data.status },
    admin,
  })
}

export async function getSubscriptionPlanById(planId) {
  const response = await api.get(`/subscription-plans/${planId}`)
  return response?.plan || response?.data || response
}

export async function deactivatePlan(planId, { admin } = {}) {
  const now = new Date().toISOString()
  const payload = { status: 'inactive', updatedAt: now }

  await api.patch(`/subscription-plans/${planId}/deactivate`, payload).catch(async () => {
    await api.put(`/subscription-plans/${planId}`, payload)
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

export async function activatePlan(planId, { admin } = {}) {
  const now = new Date().toISOString()
  const payload = { status: 'active', updatedAt: now }

  await api.patch(`/subscription-plans/${planId}/activate`, payload).catch(async () => {
    await api.put(`/subscription-plans/${planId}`, payload)
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

export async function getAssignedUserCount(planId) {
  try {
    const response = await api.get(`/subscription-plans/${planId}/assigned-count`)
    return response?.count ?? 0
  } catch {
    const response = await api.get('/user-subscriptions', { planId, status: 'active' })
    const list = Array.isArray(response) ? response : (response?.subscriptions || response?.data || [])
    return list.length
  }
}

export async function deleteSubscriptionPlan(planId, { admin } = {}) {
  const assignedCount = await getAssignedUserCount(planId)
  if (assignedCount > 0) {
    throw new Error('This plan is currently assigned to users and cannot be deleted.')
  }

  await api.delete(`/subscription-plans/${planId}`)

  logActivity({
    action: 'delete',
    module: 'Subscription Plans',
    targetType: 'subscription_plan',
    targetId: planId,
    description: 'Deleted subscription plan',
    admin,
  })
}
