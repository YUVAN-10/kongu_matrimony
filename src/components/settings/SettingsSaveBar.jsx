import { AlertCircle, RotateCcw, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SettingsSaveBar({ isDirty, isSaving, onSave, onDiscard, onReset }) {
  return (
    <div className="sticky bottom-4 z-20 rounded-2xl border border-border/70 bg-background/95 px-4 py-3 shadow-lg backdrop-blur">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertCircle className="size-4 text-primary" aria-hidden="true" />
          {isDirty ? 'Unsaved changes are ready to publish.' : 'All changes are up to date.'}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onReset} className="gap-2">
            <RotateCcw className="size-4" aria-hidden="true" />
            Restore Defaults
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onDiscard} className="gap-2">
            <Trash2 className="size-4" aria-hidden="true" />
            Discard Changes
          </Button>
          <Button type="button" size="sm" onClick={onSave} disabled={!isDirty || isSaving} className="gap-2">
            <Save className="size-4" aria-hidden="true" />
            {isSaving ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
