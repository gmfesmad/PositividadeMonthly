import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { MemberReelCount } from '../types'

interface ReelsChartProps {
  data: MemberReelCount[]
}

export function ReelsChart({ data }: ReelsChartProps) {
  if (data.length === 0) {
    return <p className="text-sm text-white/50">Sem dados para o gráfico.</p>
  }

  const chartData = data.map((d) => ({
    name: d.name.length > 12 ? `${d.name.slice(0, 11)}…` : d.name,
    fullName: d.name,
    reels: d.count,
  }))

  return (
    <div className="h-64 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.06)' }}
            contentStyle={{
              background: '#1a1a22',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12,
              fontSize: 13,
            }}
            formatter={(value) => [`${value}`, 'Reels']}
            labelFormatter={(_, payload) =>
              payload?.[0]?.payload?.fullName ?? ''
            }
          />
          <Bar dataKey="reels" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
