import api from '@/lib/api'

/**
 * Fetches real-time dashboard statistics and recent users from the backend:
 * GET /api/admin/dashboard/stats
 */
export async function getDashboardStats() {
  const response = await api.get('/admin/dashboard/stats')
  return response?.data || response
}

export default {
  getDashboardStats,
}
