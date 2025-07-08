import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message_id, status } = body

    if (!message_id || !status) {
      return NextResponse.json({ error: "Message ID and status are required" }, { status: 400 })
    }

    if (!["acknowledged", "failed"].includes(status)) {
      return NextResponse.json({ error: 'Status must be "acknowledged" or "failed"' }, { status: 400 })
    }

    const response = await fetch("http://localhost:8080/ack", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message_id, status }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: errorText || "Backend error" }, { status: response.status })
    }

    return NextResponse.json({
      success: true,
      message_id,
      status,
    })
  } catch (error) {
    console.error("❌ Acknowledge error:", error)
    return NextResponse.json({ error: "Failed to acknowledge message" }, { status: 500 })
  }
}
