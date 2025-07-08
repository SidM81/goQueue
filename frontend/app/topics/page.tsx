"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Send, Database, Layers } from "lucide-react"
import { toast } from "sonner"

interface Topic {
  name: string
  partitions: number
  created_at?: string
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [newTopicName, setNewTopicName] = useState("")
  const [newTopicPartitions, setNewTopicPartitions] = useState(3)
  const [selectedTopic, setSelectedTopic] = useState("")
  const [messagePayload, setMessagePayload] = useState('{\n  "user": "alice",\n  "action": "login"\n}')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await fetch("/api/topics")
        if (!res.ok) throw new Error("Failed to fetch topics")
        const data = await res.json()

        // Backend returns: [{ name, partitions: [0,1,...] }]
        const parsed = data.map((t: any) => ({
          name: t.name,
          partitions: t.partitions.length,
        }))

        setTopics(parsed)
      } catch (error) {
        toast.error("Failed to fetch topics, using mock")
        setTopics([
          { name: "user-events", partitions: 3 },
          { name: "order-processing", partitions: 5 },
          { name: "notifications", partitions: 2 },
        ])
      }
    }

    fetchTopics()
  }, [])


  const createTopic = async () => {
    if (!newTopicName.trim()) {
      toast.error("Topic name is required")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTopicName,
          partitions: newTopicPartitions,
        }),
      })

      if (!response.ok) throw new Error("Failed to create topic")

      const newTopic = { name: newTopicName, partitions: newTopicPartitions }
      setTopics([...topics, newTopic])
      setNewTopicName("")
      setNewTopicPartitions(3)

      toast.success(`Topic "${newTopicName}" created successfully`)
    } catch (error) {
      // Mock success for demo
      const newTopic = {
        name: newTopicName,
        partitions: newTopicPartitions,
        created_at: new Date().toISOString().split("T")[0],
      }
      setTopics([...topics, newTopic])
      setNewTopicName("")
      setNewTopicPartitions(3)

      toast.success(`Topic "${newTopicName}" created successfully (mock)`)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!selectedTopic || !messagePayload.trim()) {
      toast.error("Please select a topic and provide a message payload")
      return
    }

    try {
      JSON.parse(messagePayload) // Validate JSON
    } catch {
      toast.error("Invalid JSON payload")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/produce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedTopic,
          payload: JSON.parse(messagePayload),
        }),
      })

      if (!response.ok) throw new Error("Failed to send message")

      toast.success(`Message sent to topic "${selectedTopic}"`)
    } catch (error) {
      // Mock success for demo
      toast.success(`Message sent to topic "${selectedTopic}" (mock)`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Topics Management</h1>
        <p className="text-slate-400">Create topics and send test messages</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Topic */}
        <Card className="glass-card border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Topic
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="topic-name">Topic Name</Label>
              <Input
                id="topic-name"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                placeholder="e.g., user-events"
                className="bg-slate-800 border-slate-600"
              />
            </div>
            <div>
              <Label htmlFor="partitions">Number of Partitions</Label>
              <Input
                id="partitions"
                type="number"
                min="1"
                max="10"
                value={newTopicPartitions}
                onChange={(e) => setNewTopicPartitions(Number.parseInt(e.target.value) || 1)}
                className="bg-slate-800 border-slate-600"
              />
            </div>
            <Button onClick={createTopic} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Topic
            </Button>
          </CardContent>
        </Card>

        {/* Send Message */}
        <Card className="glass-card border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Send Test Message
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="topic-select">Select Topic</Label>
              <select
                id="topic-select"
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-100"
              >
                <option value="">Choose a topic...</option>
                {topics.map((topic) => (
                  <option key={topic.name} value={topic.name}>
                    {topic.name} ({topic.partitions} partitions)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="message-payload">Message Payload (JSON)</Label>
              <Textarea
                id="message-payload"
                value={messagePayload}
                onChange={(e) => setMessagePayload(e.target.value)}
                rows={6}
                className="bg-slate-800 border-slate-600 font-mono text-sm"
              />
            </div>
            <Button onClick={sendMessage} disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Topics List */}
      <Card className="glass-card border-slate-700 mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Existing Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topics.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No topics created yet</p>
          ) : (
            <div className="space-y-4">
              {topics.map((topic) => (
                <div
                  key={topic.name}
                  className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Layers className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold font-mono">{topic.name}</h3>
                      {topic.created_at && <p className="text-sm text-slate-400">Created {topic.created_at}</p>}
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                    {topic.partitions} partitions
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
