import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic, payload } = body

    if (!topic || !payload) {
      return NextResponse.json({ error: "Topic and payload are required" }, { status: 400 })
    }

    const response = await fetch("http://localhost:8080/produce", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ topic, payload }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: errorText || "Backend error" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("❌ Produce error:", error)
    return NextResponse.json({ error: "Failed to produce message" }, { status: 500 })
  }
}
