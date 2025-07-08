"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, CheckCircle, AlertCircle, XCircle, Clock } from "lucide-react"
import { MetricsChart } from "@/components/metrics-chart"
import { QueueVisualization } from "@/components/queue-visualization"
import { LoadingSpinner } from "@/components/loading-spinner"

interface DashboardMetrics {
  total_messages: number
  pending_messages: number
  acknowledged: number
  failed_retryable: number
  dead_lettered: number
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {

    const fetchMetrics = async () => {
      try {
        const response = await fetch("/api/dashboard")
        if (!response.ok) {
          throw new Error("Failed to fetch metrics")
        }
        const data = await response.json()
        setMetrics(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
        // Mock data for demo purposes
        setMetrics({
          total_messages: 1250,
          pending_messages: 45,
          acknowledged: 1150,
          failed_retryable: 35,
          dead_lettered: 20,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to load metrics</h2>
          <p className="text-slate-400">{error}</p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Messages",
      value: metrics.total_messages,
      icon: MessageSquare,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
    {
      title: "Pending",
      value: metrics.pending_messages,
      icon: Clock,
      color: "text-amber-400",
      bgColor: "bg-amber-500/20",
    },
    {
      title: "Acknowledged",
      value: metrics.acknowledged,
      icon: CheckCircle,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
    {
      title: "Retryable",
      value: metrics.failed_retryable,
      icon: AlertCircle,
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
    },
    {
      title: "Dead Letters",
      value: metrics.dead_lettered,
      icon: XCircle,
      color: "text-red-400",
      bgColor: "bg-red-500/20",
    },
  ]

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-slate-400">Monitor your message queue system in real-time</p>
        {error && (
          <Badge variant="destructive" className="mt-2">
            Using mock data - API unavailable
          </Badge>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.title} className="glass-card border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold font-mono">{stat.value.toLocaleString()}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="glass-card border-slate-700">
          <CardHeader>
            <CardTitle>Message Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricsChart metrics={metrics} />
          </CardContent>
        </Card>

        <Card className="glass-card border-slate-700">
          <CardHeader>
            <CardTitle>Queue Depth Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <QueueVisualization />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
