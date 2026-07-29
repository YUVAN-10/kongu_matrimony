import { Banknote, Building2, CreditCard, Landmark, Smartphone } from 'lucide-react'

// Methods aren't "good/bad" like statuses, so this stays a neutral badge —
// just an icon + label, no traffic-light colors.
const METHOD_ICONS = {
  UPI: Smartphone,
  'Credit Card': CreditCard,
  'Debit Card': CreditCard,
  'Net Banking': Landmark,
  Cash: Banknote,
  Cheque: Banknote,
  'Bank Transfer': Building2,
}

export default function PaymentMethodBadge({ method }) {
  const Icon = METHOD_ICONS[method] || CreditCard
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      <Icon className="size-3.5" aria-hidden="true" />
      {method || 'Unknown'}
    </span>
  )
}
