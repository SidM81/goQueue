"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Download, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface Message {
  id: string
  topic: string
  payload: any
  timestamp: string
  partition: number
}

export default function ConsumerPage() {
  const [topic, setTopic] = useState("user-events")
  const [consumerGroup, setConsumerGroup] = useState("email-service")
  const [currentMessage, setCurrentMessage] = useState<Message | null>(null)
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)

  const consumeMessage = async () => {
    if (!topic.trim() || !consumerGroup.trim()) {
      toast.error("Topic and consumer group are required")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/consume?topic=${topic}&group=${consumerGroup}`)

      if (!response.ok) throw new Error("Failed to consume message")

      const message = await response.json()
      setCurrentMessage(message)

      toast.success("Message consumed successfully")
    } catch (error) {
      toast.error("No messages available or backend error")
    }
    finally {
          setLoading(false)
    }
  }

  const acknowledgeMessage = async (status: "acknowledged" | "failed") => {
    if (!currentMessage) return

    setProcessing(true)
    try {
      const response = await fetch("/api/ack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message_id: currentMessage.id,
          status: status,
        }),
      })

      if (!response.ok) throw new Error("Failed to acknowledge message")

      toast.success(`Message ${status} successfully`)

      setCurrentMessage(null)
    } catch (error) {
      toast.error(`Failed to ${status} message`)
    }
    finally {
          setProcessing(false)
        }
    }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Consumer Simulator</h1>
        <p className="text-slate-400">Consume messages and manage acknowledgments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Consumer Configuration */}
        <Card className="glass-card border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Consume Message
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="consumer-topic">Topic</Label>
              <Input
                id="consumer-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., user-events"
                className="bg-slate-800 border-slate-600"
              />
            </div>
            <div>
              <Label htmlFor="consumer-group">Consumer Group</Label>
              <Input
                id="consumer-group"
                value={consumerGroup}
                onChange={(e) => setConsumerGroup(e.target.value)}
                placeholder="e.g., email-service"
                className="bg-slate-800 border-slate-600"
              />
            </div>
            <Button onClick={consumeMessage} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
              {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Pull Message
            </Button>
          </CardContent>
        </Card>

        {/* Message Display */}
        <Card className="glass-card border-slate-700">
          <CardHeader>
            <CardTitle>Current Message</CardTitle>
          </CardHeader>
          <CardContent>
            {currentMessage ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="font-mono text-xs">
                      {currentMessage.id}
                    </Badge>
                    <Badge variant="secondary">Partition {currentMessage.partition}</Badge>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-slate-400">Topic:</span>
                      <span className="ml-2 font-mono">{currentMessage.topic}</span>
                    </div>
                    <div>
                      <span className="text-sm text-slate-400">Timestamp:</span>
                      <span className="ml-2 font-mono text-sm">
                        {new Date(currentMessage.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-slate-400">Payload:</span>
                      <pre className="mt-2 p-3 bg-slate-900 rounded border border-slate-600 text-sm font-mono overflow-x-auto">
                        {JSON.stringify(currentMessage.payload, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => acknowledgeMessage("acknowledged")}
                    disabled={processing}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Acknowledge
                  </Button>
                  <Button
                    onClick={() => acknowledgeMessage("failed")}
                    disabled={processing}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Mark Failed
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <Download className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No message consumed yet</p>
                <p className="text-sm">Pull a message to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Consumer Groups Info */}
      <Card className="glass-card border-slate-700 mt-8">
        <CardHeader>
          <CardTitle>Consumer Group Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-slate-800/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-400 mb-1">3</div>
              <div className="text-sm text-slate-400">Active Consumers</div>
            </div>
            <div className="text-center p-4 bg-slate-800/30 rounded-lg">
              <div className="text-2xl font-bold text-green-400 mb-1">127</div>
              <div className="text-sm text-slate-400">Messages Processed</div>
            </div>
            <div className="text-center p-4 bg-slate-800/30 rounded-lg">
              <div className="text-2xl font-bold text-amber-400 mb-1">2.3s</div>
              <div className="text-sm text-slate-400">Avg Processing Time</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
