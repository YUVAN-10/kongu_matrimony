import { useRef, useState } from 'react'
import { ImagePlus, Loader2, Trash2, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { uploadProfilePhoto, deleteProfilePhoto } from '@/services/storageService'

/**
 * Reusable upload widget for both the single Main Profile Photo and the
 * multi-image Gallery — `multiple` toggles between the two. Selecting a
 * file shows a local preview (no network call yet); the admin then clicks
 * "Upload" to actually push it to Firebase Storage, or the X to discard it.
 * Already-uploaded photos get a hover-to-delete affordance.
 */
export default function ProfilePhotoUpload({ profileId, folder, multiple = false, value, onChange, label }) {
  const inputRef = useRef(null)
  const [pending, setPending] = useState([]) // [{ file, previewUrl }] — selected, not yet uploaded
  const [uploading, setUploading] = useState(false)
  const [deletingPath, setDeletingPath] = useState(null)
  const [error, setError] = useState(null)

  const uploaded = multiple ? value || [] : value ? [value] : []

  function handleSelectFiles(fileList) {
    const files = Array.from(fileList)
    if (files.length === 0) return
    const next = files.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }))
    setPending((prev) => (multiple ? [...prev, ...next] : next.slice(0, 1)))
    if (inputRef.current) inputRef.current.value = ''
  }

  function cancelPending(previewUrl) {
    setPending((prev) => prev.filter((item) => item.previewUrl !== previewUrl))
    URL.revokeObjectURL(previewUrl)
  }

  async function confirmUpload() {
    if (pending.length === 0) return
    setUploading(true)
    setError(null)
    try {
      const results = []
      for (const item of pending) {
        results.push(await uploadProfilePhoto(profileId, item.file, folder))
        URL.revokeObjectURL(item.previewUrl)
      }
      onChange(multiple ? [...uploaded, ...results] : results[0])
      setPending([])
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  async function handleDeleteUploaded(item) {
    setDeletingPath(item.path)
    setError(null)
    try {
      await deleteProfilePhoto(item.path)
      onChange(multiple ? uploaded.filter((photo) => photo.path !== item.path) : null)
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
        {uploaded.map((item) => (
          <div
            key={item.path}
            className="group relative size-24 overflow-hidden rounded-lg border border-border/70"
          >
            <img src={item.url} alt="" className="size-full object-cover" />
            <button
              type="button"
              onClick={() => handleDeleteUploaded(item)}
              disabled={deletingPath === item.path}
              className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-100"
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

        {pending.map((item) => (
          <div
            key={item.previewUrl}
            className="relative size-24 overflow-hidden rounded-lg border-2 border-dashed border-secondary"
          >
            <img src={item.previewUrl} alt="" className="size-full object-cover opacity-80" />
            <button
              type="button"
              onClick={() => cancelPending(item.previewUrl)}
              disabled={uploading}
              className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white"
              aria-label="Remove selected photo"
            >
              <X className="size-3" aria-hidden="true" />
            </button>
            <span className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-center text-[10px] text-white">
              Preview
            </span>
          </div>
        ))}

        {(multiple || (uploaded.length === 0 && pending.length === 0)) && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex size-24 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            <ImagePlus className="size-5" aria-hidden="true" />
            <span className="text-[11px]">Add photo</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={(event) => handleSelectFiles(event.target.files)}
        className="hidden"
      />

      {pending.length > 0 && (
        <Button type="button" size="sm" onClick={confirmUpload} disabled={uploading} className="gap-1.5">
          {uploading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Upload className="size-4" aria-hidden="true" />
          )}
          Upload {pending.length > 1 ? `${pending.length} photos` : 'photo'}
        </Button>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
