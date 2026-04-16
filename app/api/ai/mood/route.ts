import { NextRequest, NextResponse } from "next/server"
import { callOpenRouter, PROMPTS } from "@/lib/openrouter"

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()
    if (!text) return NextResponse.json({ error: "Text required" }, { status: 400 })
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: "OpenRouter API key not configured" }, { status: 503 })
    }

    const result = await callOpenRouter(
      [{ role: "user", content: PROMPTS.mood(text) }],
      { maxTokens: 10, temperature: 0.3 }
    )

    const validMoods = ["happy", "sad", "calm", "angry", "dreamy", "romantic", "neutral"]
    const detected = result.toLowerCase().trim()
    const mood = validMoods.find((m) => detected.includes(m)) || "neutral"

    return NextResponse.json({ result: mood })
  } catch (err: any) {
    console.error("AI mood error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
