import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

export default function Breadcrumb({ pageTitle }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Link to="/dashboard" className="flex items-center gap-1 transition-colors hover:text-primary">
        <Home className="size-3.5" aria-hidden="true" />
        <span>Home</span>
      </Link>
      <ChevronRight className="size-3.5" aria-hidden="true" />
      <span className="font-medium text-foreground">{pageTitle}</span>
    </nav>
  )
}
