import { NextRequest, NextResponse } from "next/server"
import { callOpenRouter, PROMPTS } from "@/lib/openrouter"

export async function POST(req: NextRequest) {
  try {
    const { text, mode } = await req.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured. Add OPENROUTER_API_KEY to your .env.local file." },
        { status: 503 }
      )
    }

    let prompt: string
    switch (mode) {
      case "fairy":   prompt = PROMPTS.fairy(text); break
      case "poetic":  prompt = PROMPTS.poetic(text); break
      case "calm":    prompt = PROMPTS.calm(text); break
      case "mature":  prompt = PROMPTS.mature(text); break
      case "minimal": prompt = PROMPTS.minimal(text); break
      case "reflection": prompt = PROMPTS.reflection(text); break
      default:        prompt = PROMPTS.rewrite(text)
    }

    const result = await callOpenRouter(
      [{ role: "user", content: prompt }],
      { maxTokens: 1200, temperature: mode === "minimal" ? 0.5 : 0.85 }
    )

    return NextResponse.json({ result, mode })
  } catch (err: any) {
    console.error("AI rewrite error:", err)
    return NextResponse.json(
      { error: err.message || "AI request failed" },
      { status: 500 }
    )
  }
}
