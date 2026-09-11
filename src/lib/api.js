import axios from 'axios'

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://9bbc6zsl-4000.inc1.devtunnels.ms/api').replace(/\/+$/, '')

const TOKEN_KEY = 'kongu_admin_token'
const ADMIN_KEY = 'kongu_admin_user'

/**
 * Retrieves the stored JWT authentication token.
 */
export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null
  } catch {
    return null
  }
}

/**
 * Stores the JWT authentication token securely.
 */
export function setAuthToken(token, rememberMe = true) {
  if (!token) {
    clearAuthToken()
    return
  }
  try {
    if (rememberMe) {
      localStorage.setItem(TOKEN_KEY, token)
      sessionStorage.removeItem(TOKEN_KEY)
    } else {
      sessionStorage.setItem(TOKEN_KEY, token)
      localStorage.removeItem(TOKEN_KEY)
    }
  } catch { }
}

/**
 * Clears the stored JWT authentication token.
 */
export function clearAuthToken() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
  } catch { }
}

/**
 * Retrieves stored admin profile data.
 */
export function getStoredAdmin() {
  try {
    const raw = localStorage.getItem(ADMIN_KEY) || sessionStorage.getItem(ADMIN_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * Stores admin profile data.
 */
export function setStoredAdmin(admin, rememberMe = true) {
  if (!admin) {
    clearStoredAdmin()
    return
  }
  try {
    const raw = JSON.stringify(admin)
    if (rememberMe) {
      localStorage.setItem(ADMIN_KEY, raw)
      sessionStorage.removeItem(ADMIN_KEY)
    } else {
      sessionStorage.setItem(ADMIN_KEY, raw)
      localStorage.removeItem(ADMIN_KEY)
    }
  } catch { }
}

/**
 * Clears stored admin profile data.
 */
export function clearStoredAdmin() {
  try {
    localStorage.removeItem(ADMIN_KEY)
    sessionStorage.removeItem(ADMIN_KEY)
  } catch { }
}

/**
 * Custom ApiError class for structured error handling.
 */
export class ApiError extends Error {
  constructor(message, status = 500, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

/**
 * Create Axios instance with default configuration.
 */
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 20000, // 20-second timeout
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

/**
 * Request Interceptor: Automatically attach JWT Bearer Token to all requests.
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken()
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

/**
 * Response Interceptor: Unwraps response data & standardizes error handling.
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Return payload directly for clean access
    return response.data
  },
  (error) => {
    if (error.response) {
      const status = error.response.status
      const data = error.response.data
      const message =
        (typeof data === 'object' && (data?.message || data?.error)) ||
        `Request failed with status ${status}`

      // Handle 401 Unauthorized
      if (status === 401) {
        clearAuthToken()
      }

      return Promise.reject(new ApiError(message, status, data))
    }

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return Promise.reject(new ApiError('Request timed out. Please check your network connection.', 408))
    }

    return Promise.reject(
      new ApiError(error.message || 'Network error occurred. Please verify backend server is running.', 0)
    )
  }
)

/**
 * Centralized API client methods.
 */
export const api = {
  get: (url, params, config = {}) => axiosInstance.get(url, { params, ...config }),
  post: (url, data, config = {}) => axiosInstance.post(url, data, config),
  put: (url, data, config = {}) => axiosInstance.put(url, data, config),
  patch: (url, data, config = {}) => axiosInstance.patch(url, data, config),
  delete: (url, config = {}) => axiosInstance.delete(url, config),
  upload: (url, formData, config = {}) =>
    axiosInstance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...config,
    }),
  getBaseUrl: () => BASE_URL,
  checkHealth: async () => {
    try {
      const res = await axiosInstance.get('/health', { timeout: 5000 })
      return res?.status === 'ok' || true
    } catch {
      return false
    }
  },
  axios: axiosInstance,
}

export default api
