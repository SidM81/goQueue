import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, partitions } = body

    if (!name || !partitions) {
      return NextResponse.json({ error: "Name and partitions are required" }, { status: 400 })
    }

    const response = await fetch("http://localhost:8080/topics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, partitions }),
    })

    if (!response.ok) {
      const err = await response.text()
      return NextResponse.json({ error: err || "Backend error" }, { status: response.status })
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Topic creation failed:", error)
    return NextResponse.json({ error: "Failed to create topic" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const response = await fetch("http://localhost:8080/topics")
    if (!response.ok) throw new Error("Failed to fetch topics")
    const data = await response.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to load topics" }, { status: 500 })
  }
}
