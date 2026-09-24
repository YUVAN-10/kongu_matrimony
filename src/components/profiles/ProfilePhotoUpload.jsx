import { useRef, useState } from 'react'
import { ImagePlus, Loader2, Trash2, AlertCircle } from 'lucide-react'
import { uploadProfilePhoto, deleteProfilePhoto, validatePhotoFile } from '@/services/storageService'

/**
 * Reusable upload widget for both single Main Profile Photo and multi-image Gallery.
 * Pre-validates files (formats: JPG, JPEG, PNG, WEBP; max size: 5MB),
 * sends multipart/form-data via Axios API client, handles loading/error states,
 * and updates parent profile state instantly.
 */
export default function ProfilePhotoUpload({ profileId, folder, multiple = false, value, onChange, label }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [deletingPath, setDeletingPath] = useState(null)
  const [error, setError] = useState(null)

  const rawUploaded = multiple ? (Array.isArray(value) ? value : value ? [value] : []) : (value ? [value] : [])
  const uploaded = rawUploaded
    .map((item) => {
      if (!item) return null
      if (typeof item === 'string') return { url: item, path: item }
      if (typeof item === 'object') {
        const url = item.url || item.downloadUrl || item.fileUrl || ''
        const path = item.path || item.key || url
        return url ? { url, path } : null
      }
      return null
    })
    .filter(Boolean)

  async function handleSelectFiles(fileList) {
    const files = Array.from(fileList)
    if (files.length === 0) return
    setError(null)

    // Pre-validate all selected files (format & size <= 5MB)
    for (const file of files) {
      try {
        validatePhotoFile(file)
      } catch (validationError) {
        setError(validationError.message)
        if (inputRef.current) inputRef.current.value = ''
        return
      }
    }

    setUploading(true)

    try {
      const results = []
      for (const file of files) {
        const res = await uploadProfilePhoto(profileId, file, folder)
        if (res && res.url) {
          results.push(res)
        }
      }
      if (results.length > 0) {
        onChange(multiple ? [...uploaded, ...results] : results[0])
      }
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleDeleteUploaded(item) {
    setDeletingPath(item.path)
    setError(null)
    try {
      if (item.path && item.path.includes('/')) {
        await deleteProfilePhoto(item.path)
      }
      const nextUploaded = multiple
        ? uploaded.filter((photo) => photo.url !== item.url && photo.path !== item.path)
        : null
      onChange(nextUploaded)
    } catch (err) {
      setError(err.message || 'Could not delete photo.')
    } finally {
      setDeletingPath(null)
    }
  }

  return (
    <div className="space-y-3">
      {label && <p className="text-sm font-medium text-foreground">{label}</p>}

      <div className="flex flex-wrap gap-3">
        {uploaded.map((item, idx) => (
          <div
            key={item.path || idx}
            className="group relative size-24 overflow-hidden rounded-lg border border-border/70 bg-muted/20"
          >
            <img src={item.url} alt="" className="size-full object-cover" />
            <button
              type="button"
              onClick={() => handleDeleteUploaded(item)}
              disabled={deletingPath === item.path}
              className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-100 cursor-pointer"
              aria-label="Delete photo"
            >
              {deletingPath === item.path ? (
                <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              ) : (
                <Trash2 className="size-5" aria-hidden="true" />
              )}
            </button>
          </div>
        ))}

        {uploading && (
          <div className="flex size-24 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-primary bg-primary/5 text-primary">
            <Loader2 className="size-6 animate-spin" />
            <span className="text-[10px] font-medium">Uploading...</span>
          </div>
        )}

        {(multiple || uploaded.length === 0) && !uploading && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex size-24 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary cursor-pointer"
          >
            <ImagePlus className="size-5" aria-hidden="true" />
            <span className="text-[11px]">Add photo</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple={multiple}
        onChange={(event) => handleSelectFiles(event.target.files)}
        className="hidden"
      />

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-destructive mt-1 font-medium">
          <AlertCircle className="size-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
