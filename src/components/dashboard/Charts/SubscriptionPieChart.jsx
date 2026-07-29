import { Pie, PieChart, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Gem } from 'lucide-react'
import ChartCard from '@/components/dashboard/Charts/ChartCard'

const COLORS = ['var(--secondary)', 'var(--muted-foreground)']

export default function SubscriptionPieChart({ data, loading }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const isEmpty = !loading && total === 0

  return (
    <ChartCard
      title="Free vs Premium"
      loading={loading}
      isEmpty={isEmpty}
      emptyIcon={Gem}
      emptyTitle="No subscription data yet"
      emptyDescription="Free vs premium breakdown will appear once users subscribe."
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 8, borderColor: 'var(--border)' }} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
