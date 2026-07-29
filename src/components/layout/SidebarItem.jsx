import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

export default function SidebarItem({ item, onNavigate }) {
  const { title, icon: Icon, path } = item

  return (
    <NavLink
      to={path}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 rounded-r-lg border-l-4 border-transparent px-3 py-2.5 text-sm text-muted-foreground transition-all duration-200',
          'hover:border-secondary/60 hover:bg-secondary/10 hover:text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          isActive &&
            'border-primary bg-primary/10 font-semibold text-primary hover:border-primary hover:bg-primary/10 hover:text-primary'
        )
      }
    >
      <Icon
        className="size-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110"
        aria-hidden="true"
      />
      <span className="truncate">{title}</span>
    </NavLink>
  )
}
