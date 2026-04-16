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
      [{ role: "user", content: PROMPTS.title(text) }],
      { maxTokens: 60, temperature: 0.9 }
    )

    return NextResponse.json({ result: result.replace(/^["'']|["'']$/g, "").trim() })
  } catch (err: any) {
    console.error("AI title error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
