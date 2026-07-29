import { cn } from '@/lib/utils'

// Shared "nothing here yet" presentation used across the app (dashboard
// charts/tables, module list pages) — a soft icon circle + title +
// description instead of bare placeholder text.
export default function EmptyState({ icon: Icon, title, description, className }) {
  return (
    <div
      className={cn(
        'flex h-full flex-col items-center justify-center gap-2 px-4 py-8 text-center',
        className
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Icon className="size-6 text-muted-foreground" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="max-w-[240px] text-xs text-muted-foreground">{description}</p>
    </div>
  )
}
