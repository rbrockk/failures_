import { NextResponse } from "next/server"
import { getIncidents } from "@/lib/incidents/repository"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const incidents = await getIncidents()
    return NextResponse.json({ incidents })
  } catch (error) {
    console.error("[API Error] Failed to fetch incidents:", error)
    return NextResponse.json({ error: "Failed to fetch incidents" }, { status: 500 })
  }
}
