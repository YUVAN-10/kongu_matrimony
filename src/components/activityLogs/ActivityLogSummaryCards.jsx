import { Award, CalendarDays, Layers, ScrollText, UserCog } from 'lucide-react'
import StatCard from '@/components/dashboard/StatCard'

export default function ActivityLogSummaryCards({ summary, loading }) {
  const cards = [
    { title: "Today's Activities", value: summary.todayCount, icon: ScrollText, accent: 'primary' },
    { title: 'This Week', value: summary.weekCount, icon: CalendarDays, accent: 'secondary' },
    { title: 'This Month', value: summary.monthCount, icon: Layers, accent: 'success' },
    { title: 'Most Active Admin', value: summary.mostActiveAdmin, icon: UserCog, accent: 'primary' },
    { title: 'Most Active Module', value: summary.mostActiveModule, icon: Award, accent: 'secondary' },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} loading={loading} />
      ))}
    </div>
  )
}
