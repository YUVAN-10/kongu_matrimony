import api from '@/lib/api'
import { removeUndefined } from '@/utils/removeUndefined'
import { logActivity } from '@/services/activityLogService'

/**
 * Normalizes backend plan payload to standard frontend object format.
 */
export function normalizePlan(raw) {
  if (!raw) return null
  const code = String(raw.code || raw.id || '').trim()
  const name = raw.name || raw.planName || code
  const price = Number(raw.price || 0)
  const validityDays = Number(raw.validityDays ?? raw.durationDays ?? 0)
  const searchResultLimit =
    raw.searchResultLimit === null || raw.searchResultLimit === undefined || raw.searchResultLimit === ''
      ? null
      : Number(raw.searchResultLimit)
  const contactQuota =
    raw.contactQuota === null || raw.contactQuota === undefined || raw.contactQuota === ''
      ? null
      : Number(raw.contactQuota)
  const photoLimit = raw.photoLimit !== undefined && raw.photoLimit !== null ? Number(raw.photoLimit) : 5
  const sortOrder = Number(raw.sortOrder ?? 0)
  const isActive = raw.isActive !== undefined ? Boolean(raw.isActive) : raw.status !== 'inactive'

  // Features list as string array
  let features = []
  if (Array.isArray(raw.features)) {
    features = raw.features.map((f) => String(f).trim()).filter(Boolean)
  } else if (raw.features && typeof raw.features === 'object') {
    features = Object.entries(raw.features)
      .filter(([, v]) => Boolean(v))
      .map(([k]) => k)
  } else if (typeof raw.features === 'string') {
    features = raw.features.split(',').map((f) => f.trim()).filter(Boolean)
  }

  return {
    id: code,
    code,
    name,
    planName: name, // backward compatibility
    price,
    validityDays,
    durationDays: validityDays, // backward compatibility
    searchResultLimit,
    contactQuota,
    photoLimit,
    features,
    isActive,
    status: isActive ? 'active' : 'inactive',
    sortOrder,
    description: raw.description || '',
    createdAt: raw.createdAt || null,
    updatedAt: raw.updatedAt || null,
    ...raw,
  }
}

/**
 * GET /api/admin/plans
 * Fetches all subscription plans from the REST API.
 */
export async function getSubscriptionPlans() {
  const response = await api.get('/admin/plans')
  const rawList = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response?.plans)
        ? response.plans
        : []

  return rawList.map(normalizePlan).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
}

/**
 * Single plan getter by code / planId.
 */
export async function getSubscriptionPlanById(planCodeOrId) {
  if (!planCodeOrId) return null
  const plans = await getSubscriptionPlans()
  const target = String(planCodeOrId).trim().toLowerCase()
  return (
    plans.find(
      (p) =>
        String(p.code).toLowerCase() === target ||
        String(p.id).toLowerCase() === target ||
        String(p.name).toLowerCase() === target
    ) || null
  )
}

/**
 * POST /api/admin/plans
 * Creates a new subscription plan.
 */
export async function createSubscriptionPlan(data, { admin } = {}) {
  const code = (data.code || data.id || '').trim().toUpperCase()
  if (!code) {
    throw new Error('Plan code is required.')
  }

  const name = (data.name || data.planName || '').trim()
  if (!name) {
    throw new Error('Plan name is required.')
  }

  const price = Number(data.price)
  if (isNaN(price) || price < 0) {
    throw new Error('Valid plan price is required.')
  }

  const validityDays = Number(data.validityDays ?? data.durationDays)
  if (isNaN(validityDays) || validityDays <= 0) {
    throw new Error('Valid plan validity (in days) is required.')
  }

  let features = []
  if (Array.isArray(data.features)) {
    features = data.features.map((f) => String(f).trim()).filter(Boolean)
  } else if (typeof data.features === 'string') {
    features = data.features.split(',').map((f) => f.trim()).filter(Boolean)
  }

  const payload = removeUndefined({
    code,
    name,
    price,
    validityDays,
    searchResultLimit:
      data.searchResultLimit === null || data.searchResultLimit === '' || data.searchResultLimit === undefined
        ? null
        : Number(data.searchResultLimit),
    contactQuota:
      data.contactQuota === null || data.contactQuota === '' || data.contactQuota === undefined
        ? null
        : Number(data.contactQuota),
    photoLimit:
      data.photoLimit !== undefined && data.photoLimit !== '' ? Number(data.photoLimit) : 5,
    features,
    sortOrder: Number(data.sortOrder ?? 0),
  })

  const response = await api.post('/admin/plans', payload)
  const created = normalizePlan(response?.data || response || payload)

  logActivity({
    action: 'create',
    module: 'Subscription Plans',
    targetType: 'subscription_plan',
    targetId: code,
    description: `Created subscription plan "${name}" (${code})`,
    newData: payload,
    admin,
  }).catch(() => {})

  return created?.code || code
}

/**
 * PUT /api/admin/plans/:code
 * Updates an existing subscription plan.
 */
export async function updateSubscriptionPlan(planCodeOrId, data, { admin } = {}) {
  const code = String(planCodeOrId).trim()
  if (!code) {
    throw new Error('Plan code is required.')
  }

  let features = undefined
  if (Array.isArray(data.features)) {
    features = data.features.map((f) => String(f).trim()).filter(Boolean)
  } else if (typeof data.features === 'string') {
    features = data.features.split(',').map((f) => f.trim()).filter(Boolean)
  }

  const payload = removeUndefined({
    name: data.name || data.planName ? String(data.name || data.planName).trim() : undefined,
    price: data.price !== undefined && data.price !== '' ? Number(data.price) : undefined,
    validityDays:
      data.validityDays !== undefined && data.validityDays !== ''
        ? Number(data.validityDays)
        : data.durationDays !== undefined && data.durationDays !== ''
          ? Number(data.durationDays)
          : undefined,
    searchResultLimit:
      data.searchResultLimit === null || data.searchResultLimit === ''
        ? null
        : data.searchResultLimit !== undefined
          ? Number(data.searchResultLimit)
          : undefined,
    contactQuota:
      data.contactQuota === null || data.contactQuota === ''
        ? null
        : data.contactQuota !== undefined
          ? Number(data.contactQuota)
          : undefined,
    photoLimit:
      data.photoLimit !== undefined && data.photoLimit !== '' ? Number(data.photoLimit) : undefined,
    features,
    isActive:
      data.isActive !== undefined
        ? Boolean(data.isActive)
        : data.status !== undefined
          ? data.status === 'active'
          : undefined,
    sortOrder: data.sortOrder !== undefined && data.sortOrder !== '' ? Number(data.sortOrder) : undefined,
  })

  const response = await api.put(`/admin/plans/${encodeURIComponent(code)}`, payload)
  const updated = normalizePlan(response?.data || response || payload)

  logActivity({
    action: 'update',
    module: 'Subscription Plans',
    targetType: 'subscription_plan',
    targetId: code,
    description: `Updated subscription plan "${data.name || data.planName || code}"`,
    newData: payload,
    admin,
  }).catch(() => {})

  return updated
}

/**
 * PATCH /api/admin/plans/:code/status
 * Toggles or sets plan active/inactive status.
 */
export async function togglePlanStatus(planCodeOrId, isActive, { admin } = {}) {
  const code = String(planCodeOrId).trim()
  const payload = typeof isActive === 'boolean' ? { isActive } : {}
  const response = await api.patch(`/admin/plans/${encodeURIComponent(code)}/status`, payload)
  const updated = normalizePlan(response?.data || response)

  logActivity({
    action: 'update',
    module: 'Subscription Plans',
    targetType: 'subscription_plan',
    targetId: code,
    description: `Toggled status of subscription plan "${code}" to ${updated?.isActive ? 'Active' : 'Inactive'}`,
    newData: { isActive: updated?.isActive },
    admin,
  }).catch(() => {})

  return updated
}

/**
 * Activates a subscription plan.
 */
export async function activatePlan(planCodeOrId, { admin } = {}) {
  return togglePlanStatus(planCodeOrId, true, { admin })
}

/**
 * Deactivates a subscription plan.
 */
export async function deactivatePlan(planCodeOrId, { admin } = {}) {
  return togglePlanStatus(planCodeOrId, false, { admin })
}

/**
 * Fetches count of users assigned to this plan.
 */
export async function getAssignedUserCount(planCodeOrId) {
  try {
    const response = await api.get('/user-subscriptions', { planId: planCodeOrId, status: 'active' })
    const list = Array.isArray(response) ? response : response?.subscriptions || response?.data || []
    return list.length
  } catch {
    return 0
  }
}

