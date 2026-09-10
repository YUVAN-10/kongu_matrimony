import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Wallet } from 'lucide-react'
import ChartCard from '@/components/dashboard/Charts/ChartCard'
import { formatCurrency } from '@/utils/helpers'

export default function RevenueChart({ data, loading }) {
  const isEmpty = !loading && data.every((point) => point.revenue === 0)

  return (
    <ChartCard
      title="Monthly Revenue"
      loading={loading}
      isEmpty={isEmpty}
      emptyIcon={Wallet}
      emptyTitle="No revenue yet"
      emptyDescription="Successful payments will show up here once processed."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="var(--muted-foreground)"
            tickFormatter={(value) => formatCurrency(value)}
            width={70}
          />
          <Tooltip
            formatter={(value) => formatCurrency(value)}
            contentStyle={{ borderRadius: 8, borderColor: 'var(--border)' }}
          />
          <Bar dataKey="revenue" fill="var(--secondary)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
