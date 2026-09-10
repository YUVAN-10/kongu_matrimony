import api from '@/lib/api'

export async function uploadProfilePhoto(profileId, file, folder = 'gallery') {
  const formData = new FormData()
  formData.append('photo', file)
  formData.append('profileId', profileId)
  formData.append('folder', folder)

  const response = await api.upload('/upload/profile-photo', formData)
  return {
    url: response?.url || response?.downloadUrl || response?.data?.url || '',
    path: response?.path || response?.key || response?.data?.path || '',
  }
}

export async function deleteProfilePhoto(path) {
  if (!path) return
  await api.delete('/upload/profile-photo', { path }).catch(() => {})
}
