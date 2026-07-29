import { Calendar, CalendarDays, Clock, RotateCcw, Wallet, XCircle } from 'lucide-react'
import StatCard from '@/components/dashboard/StatCard'
import { formatCurrency } from '@/utils/helpers'

export default function PaymentSummaryCards({ summary, loading }) {
  const cards = [
    { title: 'Total Revenue', value: formatCurrency(summary.totalRevenue), icon: Wallet, accent: 'success' },
    { title: "Today's Revenue", value: formatCurrency(summary.todaysRevenue), icon: Calendar, accent: 'primary' },
    { title: 'This Month Revenue', value: formatCurrency(summary.monthRevenue), icon: CalendarDays, accent: 'secondary' },
    { title: 'Pending Payments', value: summary.pendingCount, icon: Clock, accent: 'secondary' },
    { title: 'Failed Payments', value: summary.failedCount, icon: XCircle, accent: 'destructive' },
    { title: 'Refunded Payments', value: summary.refundedCount, icon: RotateCcw, accent: 'primary' },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} loading={loading} />
      ))}
    </div>
  )
}
