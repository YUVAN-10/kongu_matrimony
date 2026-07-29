import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// Reusable "titled card" wrapper — used for every step of the profile form
// AND for every section of the read-only ViewProfile page, so the two
// surfaces share the exact same visual grouping.
export default function ProfileSection({ title, description, icon: Icon, children, className }) {
  return (
    <Card className={cn('border-border/70 shadow-sm', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-lg text-foreground">
          {Icon && <Icon className="size-5 text-primary" aria-hidden="true" />}
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  )
}
