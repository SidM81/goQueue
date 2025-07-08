import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const topic = searchParams.get("topic")
    const group = searchParams.get("group")

    if (!topic || !group) {
      return NextResponse.json({ error: "Topic and group are required" }, { status: 400 })
    }

    const response = await fetch(`http://localhost:8080/consume?topic=${topic}&group=${group}`)

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: errorText || "Backend error" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("❌ Consume fetch failed:", error)
    return NextResponse.json({ error: "Failed to consume message" }, { status: 500 })
  }
}
