import { Pie, PieChart, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Users } from 'lucide-react'
import ChartCard from '@/components/dashboard/Charts/ChartCard'

const COLORS = ['var(--primary)', 'var(--secondary)']

export default function GenderPieChart({ data, loading }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const isEmpty = !loading && total === 0

  return (
    <ChartCard
      title="Male vs Female"
      loading={loading}
      isEmpty={isEmpty}
      emptyIcon={Users}
      emptyTitle="No profiles yet"
      emptyDescription="Gender distribution will appear once profiles are added."
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
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
