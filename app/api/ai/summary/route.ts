import { NextRequest, NextResponse } from "next/server"
import { callOpenRouter, PROMPTS } from "@/lib/openrouter"

export async function POST(req: NextRequest) {
  try {
    const { entries, type } = await req.json()
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json({ error: "Entries required" }, { status: 400 })
    }
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: "OpenRouter API key not configured" }, { status: 503 })
    }

    const entriesText = entries
      .slice(0, type === "monthly" ? 30 : 7)
      .map((e: any) => `[${e.createdAt?.slice(0, 10) || ""}] ${e.mood?.toUpperCase() || ""}: ${e.rawText || ""}`)
      .join("\n")

    const prompt = type === "monthly"
      ? PROMPTS.monthlySummary(entriesText)
      : PROMPTS.weeklySummary(entriesText)

    const result = await callOpenRouter(
      [{ role: "user", content: prompt }],
      { maxTokens: 500, temperature: 0.75 }
    )

    return NextResponse.json({ result })
  } catch (err: any) {
    console.error("AI summary error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
