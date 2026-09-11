import { Pie, PieChart, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Users } from 'lucide-react'
import ChartCard from '@/components/dashboard/Charts/ChartCard'

const COLORS = ['#3b82f6', '#ec4899']

export default function GenderPieChart({ data = [], loading }) {
  const total = data.reduce((sum, item) => sum + (Number(item.value) || 0), 0)
  const isEmpty = !loading && total === 0

  return (
    <ChartCard
      title="Gender Distribution"
      loading={loading}
      isEmpty={isEmpty}
      emptyIcon={Users}
      emptyTitle="No gender data"
      emptyDescription="Gender distribution will appear once user data is available."
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            label={({ name, value }) => `${name}: ${value}`}
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
