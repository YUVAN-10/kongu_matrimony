import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '@/firebase/firebase'

const PROFILE_PHOTOS_ROOT = 'profile-photos'

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
}

/**
 * Uploads a single file under profile-photos/{profileId}/{folder}/... and
 * returns both the public download URL (for display) and the storage path
 * (needed later to delete the file). `folder` is typically 'main' or
 * 'gallery' — kept generic so callers decide the structure.
 */
export async function uploadProfilePhoto(profileId, file, folder = 'gallery') {
  const path = `${PROFILE_PHOTOS_ROOT}/${profileId}/${folder}/${Date.now()}-${sanitizeFileName(file.name)}`
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  const url = await getDownloadURL(storageRef)
  return { url, path }
}

/** Deletes a previously uploaded photo by its storage path (not its URL). */
export async function deleteProfilePhoto(path) {
  await deleteObject(ref(storage, path))
}
