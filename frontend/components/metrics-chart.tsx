"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface MetricsChartProps {
  metrics: {
    acknowledged: number
    pending_messages: number
    failed_retryable: number
    dead_lettered: number
  }
}

const COLORS = {
  acknowledged: "#10B981",
  pending: "#F59E0B",
  retryable: "#F97316",
  dead: "#EF4444",
}

export function MetricsChart({ metrics }: MetricsChartProps) {
  const data = [
    {
      name: "Acknowledged",
      value: metrics.acknowledged,
      color: COLORS.acknowledged,
    },
    {
      name: "Pending",
      value: metrics.pending_messages,
      color: COLORS.pending,
    },
    {
      name: "Retryable",
      value: metrics.failed_retryable,
      color: COLORS.retryable,
    },
    {
      name: "Dead Letters",
      value: metrics.dead_lettered,
      color: COLORS.dead,
    },
  ].filter((item) => item.value > 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="glass-card p-3 border border-slate-600">
          <p className="text-sm font-medium">{data.name}</p>
          <p className="text-lg font-bold" style={{ color: data.payload.color }}>
            {data.value.toLocaleString()}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ color: "#94A3B8" }}
            formatter={(value, entry: any) => <span style={{ color: entry.color }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
