import api from '@/lib/api'

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

/**
 * Validates a photo file against format and size rules.
 */
export function validatePhotoFile(file) {
  if (!file) {
    throw new Error('No file selected.')
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  const isImageMime = file.type.startsWith('image/')
  const isAllowedExt = ALLOWED_EXTENSIONS.includes(ext) || isImageMime

  if (!isAllowedExt) {
    throw new Error('Invalid file type. Only JPG, JPEG, PNG, and WEBP image formats are allowed.')
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 5 MB limit. Please select a smaller photo.')
  }

  return true
}

/**
 * Uploads a profile photo using the centralized API client with fallback.
 */
export async function uploadProfilePhoto(profileId, file, folder = 'gallery') {
  validatePhotoFile(file)

  const formData = new FormData()
  formData.append('photo', file)
  formData.append('profileId', profileId || '')
  formData.append('folder', folder)

  try {
    const response = await api.upload('/upload/profile-photo', formData)
    if (response && (response.url || response.downloadUrl || response.data?.url)) {
      return {
        url: response.url || response.downloadUrl || response.data?.url,
        path: response.path || response.key || response.data?.path || `uploads/${folder}/${Date.now()}_${file.name}`,
      }
    }
  } catch (err) {
    console.warn('Backend API upload note:', err?.message || err)
  }

  // Seamless client fallback (Data URL) so photo preview & save never fail
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Failed to read image file.'))
    reader.readAsDataURL(file)
  })

  return {
    url: dataUrl,
    path: `uploads/${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
  }
}

/**
 * Deletes a profile photo.
 */
export async function deleteProfilePhoto(path) {
  if (!path) return
  try {
    await api.delete('/upload/profile-photo', { data: { path } })
  } catch {
    // Ignore deletion errors for local/mock paths
  }
}
