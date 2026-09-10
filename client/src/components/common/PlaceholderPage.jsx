import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function PlaceholderPage({ title, description = 'This module is coming soon.' }) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="font-heading text-xl text-foreground">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}
