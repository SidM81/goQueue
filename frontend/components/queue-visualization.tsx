"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"

interface QueueData {
  topic: string
  partitions: Array<{
    id: number
    depth: number
    maxDepth: number
  }>
}

export function QueueVisualization() {
  const [queueData, setQueueData] = useState<QueueData[]>([])

  useEffect(() => {
    // Mock queue data with animation
    const mockData: QueueData[] = [
      {
        topic: "user-events",
        partitions: [
          { id: 0, depth: 45, maxDepth: 100 },
          { id: 1, depth: 23, maxDepth: 100 },
          { id: 2, depth: 67, maxDepth: 100 },
        ],
      },
      {
        topic: "order-processing",
        partitions: [
          { id: 0, depth: 12, maxDepth: 100 },
          { id: 1, depth: 89, maxDepth: 100 },
          { id: 2, depth: 34, maxDepth: 100 },
          { id: 3, depth: 56, maxDepth: 100 },
          { id: 4, depth: 78, maxDepth: 100 },
        ],
      },
      {
        topic: "notifications",
        partitions: [
          { id: 0, depth: 91, maxDepth: 100 },
          { id: 1, depth: 15, maxDepth: 100 },
        ],
      },
    ]

    setQueueData(mockData)

    // Simulate real-time updates
    const interval = setInterval(() => {
      setQueueData((prev) =>
        prev.map((topic) => ({
          ...topic,
          partitions: topic.partitions.map((partition) => ({
            ...partition,
            depth: Math.max(0, Math.min(100, partition.depth + (Math.random() - 0.5) * 10)),
          })),
        })),
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const getDepthColor = (depth: number) => {
    if (depth < 30) return "bg-green-500"
    if (depth < 70) return "bg-amber-500"
    return "bg-red-500"
  }

  const getDepthLabel = (depth: number) => {
    if (depth < 30) return "Low"
    if (depth < 70) return "Medium"
    return "High"
  }

  return (
    <div className="space-y-6">
      {queueData.map((topic) => (
        <div key={topic.topic} className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold font-mono text-sm">{topic.topic}</h4>
            <span className="text-xs text-slate-400">{topic.partitions.length} partitions</span>
          </div>

          <div className="space-y-2">
            {topic.partitions.map((partition) => (
              <div key={partition.id} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-12">P{partition.id}</span>
                <div className="flex-1">
                  <Progress value={partition.depth} className="h-2" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono w-8 text-right">{Math.round(partition.depth)}%</span>
                  <div className={`w-2 h-2 rounded-full ${getDepthColor(partition.depth)}`} />
                  <span className="text-xs text-slate-400 w-12">{getDepthLabel(partition.depth)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
