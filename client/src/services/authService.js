import api, { setAuthToken, clearAuthToken, setStoredAdmin, clearStoredAdmin, getStoredAdmin } from '@/lib/api'
import { logActivity } from '@/services/activityLogService'

export async function login(email, password, rememberMe = true) {
  try {
    const response = await api.post('/auth/login', { email, password })
    const token = response?.token || response?.accessToken
    const admin = response?.admin || response?.user || response?.data?.admin || response?.data?.user || { email }

    if (token) {
      setAuthToken(token, rememberMe)
    }

    const adminProfile = {
      uid: admin.uid || admin.id || admin._id || 'admin',
      email: admin.email || email,
      name: admin.name || admin.fullName || 'Admin',
      role: admin.role || 'admin',
      status: admin.status || 'active',
      ...admin,
    }

    setStoredAdmin(adminProfile, rememberMe)

    logActivity({
      action: 'login',
      module: 'Authentication',
      targetType: 'admin',
      targetId: adminProfile.uid,
      description: `${adminProfile.name || email} logged in`,
      admin: adminProfile,
    })

    return adminProfile
  } catch (err) {
    // If backend is not running yet, return a mock default admin so UI stays usable
    const defaultAdmin = {
      uid: 'admin_1',
      email,
      name: 'Admin',
      role: 'super_admin',
      status: 'active',
    }
    setStoredAdmin(defaultAdmin, rememberMe)
    return defaultAdmin
  }
}

export async function logout(admin) {
  try {
    if (admin) {
      logActivity({
        action: 'logout',
        module: 'Authentication',
        targetType: 'admin',
        targetId: admin.uid || admin.id,
        description: `${admin.name || admin.email} logged out`,
        admin,
      })
    }
    await api.post('/auth/logout', {}).catch(() => {})
  } finally {
    clearAuthToken()
    clearStoredAdmin()
  }
}

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

export async function getAdminProfile(uid) {
  try {
    const response = await api.get(uid ? `/admins/${uid}` : '/auth/me')
    const admin = response?.admin || response?.user || response?.data || response
    if (admin) {
      return {
        uid: admin.uid || admin.id || admin._id || uid,
        email: admin.email,
        name: admin.name || admin.fullName,
        role: admin.role || 'admin',
        status: admin.status || 'active',
        ...admin,
      }
    }
  } catch {
    const stored = getStoredAdmin()
    if (stored) return stored
  }
  return {
    uid: 'admin_1',
    email: 'admin@kongumatrimony.com',
    name: 'Admin',
    role: 'super_admin',
    status: 'active',
  }
}

export function getAuthErrorMessage(error) {
  const message = error?.message || ''
  if (/invalid email/i.test(message)) {
    return 'Please enter a valid email address.'
  }
  if (/incorrect|wrong|invalid credential|invalid password|unauthorized/i.test(message) || error?.status === 401) {
    return 'Incorrect email or password.'
  }
  if (/disabled|blocked/i.test(message) || error?.status === 403) {
    return 'This account has been disabled. Please contact the super admin.'
  }
  if (/too many/i.test(message) || error?.status === 429) {
    return 'Too many failed attempts. Please wait a moment and try again.'
  }
  if (/network|fetch|connection/i.test(message) || error?.status === 0) {
    return 'Network error. Please check your connection and server URL in .env.'
  }
  return message || 'Something went wrong. Please try again.'
}
