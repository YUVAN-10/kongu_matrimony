import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp } from 'lucide-react'
import ChartCard from '@/components/dashboard/Charts/ChartCard'

export default function RegistrationChart({ data, loading }) {
  const isEmpty = !loading && data.every((point) => point.registrations === 0)

  return (
    <ChartCard
      title="Monthly User Registration"
      loading={loading}
      isEmpty={isEmpty}
      emptyIcon={TrendingUp}
      emptyTitle="No registrations yet"
      emptyDescription="Profiles will appear here once users start registering."
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
          <Tooltip contentStyle={{ borderRadius: 8, borderColor: 'var(--border)' }} />
          <Line
            type="monotone"
            dataKey="registrations"
            stroke="var(--primary)"
            strokeWidth={2.5}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
