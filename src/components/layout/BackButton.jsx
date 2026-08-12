import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Mobile-only "Back" — lives at the top of the scrollable page content
 * (rendered once in AdminLayout, above <Outlet/>) rather than pinned in the
 * fixed Navbar, so it reads as part of each page rather than a persistent
 * chrome element. Desktop/tablet never show it (lg:hidden matches the
 * breakpoint the Sidebar collapses at, same as the hamburger menu button).
 */
export default function BackButton() {
  const navigate = useNavigate()

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => navigate(-1)}
      className="mb-3 -ml-2 gap-1 text-muted-foreground hover:text-foreground lg:hidden"
    >
      <ChevronLeft className="size-4" aria-hidden="true" />
      Back
    </Button>
  )
}
