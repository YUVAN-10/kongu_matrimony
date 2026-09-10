import api, { setAuthToken, clearAuthToken, setStoredAdmin, clearStoredAdmin, getStoredAdmin, getAuthToken } from '@/lib/api'
import { logActivity } from '@/services/activityLogService'

/**
 * Logs in the admin user using the backend endpoint:
 * POST /api/admin/auth/login
 * Body: { email, password }
 */
export async function login(email, password, rememberMe = true) {
  const response = await api.post('/admin/auth/login', { email, password })

  // Extract token from standard or nested payload response
  const token =
    response?.data?.token ||
    response?.token ||
    response?.accessToken

  // Extract admin object
  const adminData =
    response?.data?.admin ||
    response?.data?.user ||
    response?.admin ||
    response?.user ||
    response?.data ||
    { email }

  if (token) {
    setAuthToken(token, rememberMe)
  }

  const adminProfile = {
    id: adminData.id || adminData._id || adminData.uid || 'admin',
    uid: adminData.id || adminData._id || adminData.uid || 'admin',
    email: adminData.email || email,
    name: adminData.name || adminData.fullName || 'Admin',
    role: adminData.role || 'super_admin',
    status: adminData.status || 'active',
    ...adminData,
  }

  setStoredAdmin(adminProfile, rememberMe)

  logActivity({
    action: 'login',
    module: 'Authentication',
    targetType: 'admin',
    targetId: adminProfile.id,
    description: `${adminProfile.name || email} logged in`,
    admin: adminProfile,
  }).catch(() => {})

  return adminProfile
}

/**
 * Logs out the admin user and clears authentication session.
 */
export async function logout(admin) {
  try {
    if (admin) {
      logActivity({
        action: 'logout',
        module: 'Authentication',
        targetType: 'admin',
        targetId: admin.id || admin.uid,
        description: `${admin.name || admin.email} logged out`,
        admin,
      }).catch(() => {})
    }
    await api.post('/admin/auth/logout', {}).catch(() => {})
  } finally {
    clearAuthToken()
    clearStoredAdmin()
  }
}

/**
 * Fetches the currently authenticated admin profile using:
 * GET /api/admin/auth/me
 */
export async function getAdminProfile() {
  const token = getAuthToken()
  if (!token) {
    return null
  }

  try {
    const response = await api.get('/admin/auth/me')
    const adminData =
      response?.data?.admin ||
      response?.data?.user ||
      response?.data ||
      response?.admin ||
      response?.user ||
      response

    if (adminData && (adminData.id || adminData.email)) {
      const adminProfile = {
        id: adminData.id || adminData._id || adminData.uid,
        uid: adminData.id || adminData._id || adminData.uid,
        email: adminData.email,
        name: adminData.name || adminData.fullName || 'Admin',
        role: adminData.role || 'super_admin',
        status: adminData.status || 'active',
        ...adminData,
      }
      setStoredAdmin(adminProfile)
      return adminProfile
    }
  } catch (error) {
    // If 401 Unauthorized, clear session
    if (error?.status === 401) {
      clearAuthToken()
      clearStoredAdmin()
      return null
    }
    // For other temporary errors, return cached stored admin if available
    const stored = getStoredAdmin()
    if (stored) return stored
    throw error
  }

  return getStoredAdmin()
}

/**
 * Creates a user account via API.
 */
export async function createUserAccount({ email, password, name, phone, gender, city }) {
  const response = await api.post('/auth/create-user', {
    email,
    password,
    name,
    phone,
    gender,
    city,
  }).catch(() => ({}))
  const uid = response?.uid || response?.id || response?.user?.id || response?.user?.uid || response?.data?.id
  return uid || `user_${Date.now()}`
}

/**
 * Maps API / Auth errors to human-readable user messages.
 */
export function getAuthErrorMessage(error) {
  const message = error?.message || (typeof error?.data === 'string' ? error.data : error?.data?.message) || ''
  if (/invalid email/i.test(message)) {
    return 'Please enter a valid email address.'
  }
  if (/incorrect|wrong|invalid credential|invalid password|unauthorized/i.test(message) || error?.status === 401) {
    return 'Incorrect email or password.'
  }
  if (/disabled|blocked/i.test(message) || error?.status === 403) {
    return 'This account has been disabled. Please contact the administrator.'
  }
  if (/too many/i.test(message) || error?.status === 429) {
    return 'Too many failed attempts. Please wait a moment and try again.'
  }
  if (/network|fetch|connection/i.test(message) || error?.status === 0) {
    return 'Network error. Please verify the server connection.'
  }
  return message || 'Authentication failed. Please try again.'
}
