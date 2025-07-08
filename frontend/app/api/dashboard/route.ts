import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = await fetch("http://localhost:8080/dashboard")

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: errorText || "Backend error" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("❌ Dashboard fetch failed:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard metrics" }, { status: 500 })
  }
}
