import { BadgeCheck, BrushCleaning, Database, Globe2, Mail, PanelTop, Phone, ShieldCheck, ShoppingCart, Sparkles, Users } from 'lucide-react'

const sectionIcons = {
  general: Globe2,
  branding: BrushCleaning,
  contact: Phone,
  socialMedia: Sparkles,
  subscription: ShoppingCart,
  application: PanelTop,
  security: ShieldCheck,
  email: Mail,
  storage: Database,
}

export default function SettingsSidebar({ sections, activeSection, onSelectSection }) {
  return (
    <aside className="lg:sticky lg:top-24 lg:h-fit w-full">
      <div className="rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm backdrop-blur">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Configuration</p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">Application Settings</h2>
        </div>

        <nav className="space-y-1.5">
          {sections.map((section) => {
            const Icon = sectionIcons[section.key] || Users
            const isActive = section.key === activeSection

            return (
              <button
                key={section.key}
                type="button"
                onClick={() => onSelectSection(section.key)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon className="size-4" aria-hidden="true" />
                  {section.label}
                </span>
                {isActive ? <BadgeCheck className="size-4" aria-hidden="true" /> : null}
              </button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
