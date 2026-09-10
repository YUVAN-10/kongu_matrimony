import { Loader2 } from 'lucide-react'

export default function FullScreenLoader({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-3 bg-background text-foreground">
      <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
