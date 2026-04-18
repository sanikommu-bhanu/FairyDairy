"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { Save, X, ChevronDown, Tag, Cloud, Sparkles, Heart, Check } from "lucide-react"
import { useAppStore } from "@/store/app-store"
import { MoodSelector } from "./MoodSelector"
import { AIToolbar } from "@/features/ai/AIToolbar"
import { MediaPicker } from "@/features/media/MediaPicker"
import { MagicButton } from "@/components/ui/MagicButton"
import { showToast } from "@/components/ui/Toast"
import { countWords, cn } from "@/lib/utils"
import { WEATHER_CONFIG } from "@/types"
import type { Mood, Weather } from "@/types"

const SUGGESTED_TAGS = ["gratitude", "growth", "dreams", "family", "work", "health", "love", "adventure", "food", "nature", "reflection", "goals"]

export function EntryEditor() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("id")
  const { addEntry, updateEntry, entries } = useAppStore()

  const existing = editId ? entries.find((e) => e.id === editId) : null

  const [title, setTitle] = useState(existing?.title || "")
  const [rawText, setRawText] = useState(existing?.rawText || "")
  const [enhancedText, setEnhancedText] = useState(existing?.enhancedText || "")
  const [mood, setMood] = useState<Mood>(existing?.mood || "neutral")
  const [weather, setWeather] = useState<Weather | undefined>(existing?.weather)
  const [gratitude, setGratitude] = useState(existing?.gratitude || "")
  const [tags, setTags] = useState<string[]>(existing?.tags || [])
  const [tagInput, setTagInput] = useState("")
  const [favorite, setFavorite] = useState(existing?.favorite || false)
  const [mediaIds, setMediaIds] = useState<string[]>(existing?.mediaIds || [])
  const [showExtras, setShowExtras] = useState(false)
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle")
  const [activeTab, setActiveTab] = useState<"write" | "enhanced">("write")
  const [reflectionQuestions, setReflectionQuestions] = useState<string[]>([])

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = "auto"
      ta.style.height = ta.scrollHeight + "px"
    }
  }, [rawText])

  // Autosave draft
  const doSaveDraft = useCallback(() => {
    if (!rawText.trim()) return
    setSaveState("saving")
    const data = {
      title: title || "Untitled",
      rawText,
      enhancedText: enhancedText || undefined,
      mood,
      tags,
      weather,
      gratitude: gratitude || undefined,
      favorite,
      mediaIds,
      isDraft: true,
      wordCount: countWords(rawText),
    }
    if (editId && existing) {
      updateEntry(editId, { ...data, isDraft: true })
    }
    setSaveState("saved")
    setTimeout(() => setSaveState("idle"), 2000)
  }, [rawText, title, enhancedText, mood, tags, weather, gratitude, favorite, mediaIds, editId, existing, updateEntry])

  useEffect(() => {
    clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(doSaveDraft, 3000)
    return () => clearTimeout(autoSaveTimer.current)
  }, [rawText, title, doSaveDraft])

  const handleSave = (asDraft = false) => {
    if (!rawText.trim()) {
      showToast("Write something first ✍️", "info")
      return
    }
    const data = {
      title: title || `Entry — ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })}`,
      rawText,
      enhancedText: enhancedText || undefined,
      mood,
      tags,
      weather,
      gratitude: gratitude || undefined,
      favorite,
      mediaIds,
      isDraft: asDraft,
      wordCount: countWords(rawText),
    }
    if (editId && existing) {
      updateEntry(editId, data)
      showToast("Entry updated! ✨")
    } else {
      addEntry(data)
      showToast(asDraft ? "Draft saved 📝" : "Entry saved! ✨")
    }
    router.push("/home")
  }

  const handleAIResult = (result: string, type: "enhanced" | "title" | "mood" | "reflection") => {
    if (type === "enhanced") {
      setEnhancedText(result)
      setActiveTab("enhanced")
    } else if (type === "title") {
      setTitle(result.replace(/^["']|["']$/g, ""))
    } else if (type === "mood") {
      const detectedMood = result.toLowerCase().trim() as Mood
      const validMoods: Mood[] = ["happy", "sad", "calm", "angry", "dreamy", "romantic", "neutral"]
      if (validMoods.includes(detectedMood)) {
        setMood(detectedMood)
      }
    } else if (type === "reflection") {
      const questions = result.split("\n").filter((l) => l.match(/^\d+\./) ).map((q) => q.replace(/^\d+\.\s*/, ""))
      setReflectionQuestions(questions)
    }
  }

  const addTag = (tag: string) => {
    const clean = tag.trim().toLowerCase().replace(/[^a-z0-9-]/g, "")
    if (clean && !tags.includes(clean) && tags.length < 8) {
      setTags([...tags, clean])
    }
    setTagInput("")
  }

  return (
    <div className="min-h-screen px-4 pt-6 pb-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 glass rounded-xl text-fairy-text-muted hover:text-fairy-text"
        >
          <X size={20} />
        </button>
        <div className="flex items-center gap-2">
          {/* Autosave indicator */}
          <AnimatePresence>
            {saveState !== "idle" && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "text-xs flex items-center gap-1 px-2 py-1 rounded-lg",
                  saveState === "saving" ? "text-fairy-text-muted" : "text-green-400"
                )}
              >
                {saveState === "saving" ? (
                  <><span className="w-2 h-2 rounded-full bg-current animate-pulse" />Saving…</>
                ) : (
                  <><Check size={12} />Saved</>
                )}
              </motion.span>
            )}
          </AnimatePresence>
          <button
            onClick={() => setFavorite(!favorite)}
            className="p-2 glass rounded-xl"
          >
            <Heart size={18} className={favorite ? "text-rose-400 fill-rose-400" : "text-fairy-text-muted"} />
          </button>
          <MagicButton size="sm" onClick={() => handleSave(false)}>
            <Save size={15} />
            Save
          </MagicButton>
        </div>
      </div>

      {/* Title */}
      <input
        type="text"
        placeholder="Give your entry a title…"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full bg-transparent text-2xl font-display font-bold text-fairy-text placeholder-fairy-text-muted/30 focus:outline-none mb-1"
      />

      {/* Date + word count */}
      <div className="flex items-center gap-3 mb-5 text-xs text-fairy-text-muted/60">
        <span>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
        <span>·</span>
        <span>{countWords(rawText)} words</span>
      </div>

      {/* Mood selector */}
      <div className="mb-5">
        <MoodSelector value={mood} onChange={setMood} />
      </div>

      {/* Text area tabs */}
      {enhancedText && (
        <div className="flex gap-1 mb-2">
          {(["write", "enhanced"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-lg transition-all",
                activeTab === tab
                  ? "bg-fairy-purple/20 text-fairy-purple"
                  : "text-fairy-text-muted hover:text-fairy-text"
              )}
            >
              {tab === "write" ? "✍️ Original" : "✨ Enhanced"}
            </button>
          ))}
        </div>
      )}

      {/* Writing area */}
      <div className="relative mb-4">
        <textarea
          ref={textareaRef}
          value={activeTab === "write" ? rawText : enhancedText}
          onChange={(e) => {
            if (activeTab === "write") setRawText(e.target.value)
            else setEnhancedText(e.target.value)
          }}
          placeholder="Pour your heart out… write about your day, your feelings, your dreams. This space is entirely yours. ✨"
          className="w-full min-h-[200px] bg-transparent text-fairy-text placeholder-fairy-text-muted/30 focus:outline-none diary-text resize-none leading-loose"
        />
        {activeTab === "enhanced" && (
          <div className="absolute top-0 right-0 text-xs text-fairy-purple/60 bg-fairy-purple/10 px-2 py-1 rounded-lg">
            ✨ AI Enhanced
          </div>
        )}
      </div>

      {/* Reflection questions */}
      <AnimatePresence>
        {reflectionQuestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass rounded-xl p-4 mb-4 border border-fairy-purple/20"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-fairy-purple">🪞 Reflection Questions</p>
              <button onClick={() => setReflectionQuestions([])} className="text-fairy-text-muted text-xs">dismiss</button>
            </div>
            <div className="space-y-2">
              {reflectionQuestions.map((q, i) => (
                <p key={i} className="text-sm text-fairy-text/80 leading-relaxed">{i + 1}. {q}</p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Toolbar */}
      <div className="mb-4">
        <AIToolbar text={activeTab === "write" ? rawText : enhancedText} onResult={handleAIResult} />
      </div>

      {/* Media attachments */}
      <div className="mb-4">
        <MediaPicker mediaIds={mediaIds} onChange={setMediaIds} />
      </div>

      {/* Extra fields toggle */}
      <button
        type="button"
        onClick={() => setShowExtras(!showExtras)}
        className="flex items-center gap-2 text-sm text-fairy-text-muted mb-3 hover:text-fairy-text transition-colors"
      >
        <ChevronDown
          size={16}
          className={cn("transition-transform duration-200", showExtras && "rotate-180")}
        />
        {showExtras ? "Hide" : "Add"} weather, gratitude & tags
      </button>

      <AnimatePresence>
        {showExtras && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden space-y-4 mb-4"
          >
            {/* Weather */}
            <div>
              <p className="text-xs text-fairy-text-muted mb-2 flex items-center gap-1.5">
                <Cloud size={12} />Weather
              </p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(WEATHER_CONFIG) as Weather[]).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setWeather(weather === w ? undefined : w)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-sm glass border transition-all",
                      weather === w
                        ? "border-fairy-purple/60 text-fairy-text bg-fairy-purple/15"
                        : "border-fairy-border text-fairy-text-muted hover:border-fairy-purple/30"
                    )}
                  >
                    {WEATHER_CONFIG[w].emoji} {WEATHER_CONFIG[w].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gratitude */}
            <div>
              <p className="text-xs text-fairy-text-muted mb-2">🙏 I am grateful for…</p>
              <textarea
                value={gratitude}
                onChange={(e) => setGratitude(e.target.value)}
                placeholder="Something you appreciate today…"
                rows={2}
                className="w-full glass rounded-xl px-3 py-2 text-sm text-fairy-text placeholder-fairy-text-muted/40 focus:outline-none focus:border-fairy-purple/40 border border-fairy-border resize-none"
              />
            </div>

            {/* Tags */}
            <div>
              <p className="text-xs text-fairy-text-muted mb-2 flex items-center gap-1.5">
                <Tag size={12} />Tags
              </p>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-xs text-fairy-purple bg-fairy-purple/15 px-2 py-1 rounded-full border border-fairy-purple/20"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => setTags(tags.filter((t) => t !== tag))}
                        className="text-fairy-purple/60 hover:text-fairy-rose ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault()
                    addTag(tagInput)
                  }
                }}
                placeholder="Add a tag and press Enter"
                className="w-full glass rounded-xl px-3 py-2 text-sm text-fairy-text placeholder-fairy-text-muted/40 focus:outline-none border border-fairy-border"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).slice(0, 6).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addTag(tag)}
                    className="text-xs text-fairy-text-muted/60 bg-white/5 hover:bg-fairy-purple/10 hover:text-fairy-purple px-2 py-0.5 rounded-full border border-fairy-border/50 transition-all"
                  >
                    +{tag}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save buttons */}
      <div className="flex gap-3 pt-2">
        <MagicButton variant="secondary" size="md" onClick={() => handleSave(true)} className="flex-1">
          Save Draft
        </MagicButton>
        <MagicButton size="md" onClick={() => handleSave(false)} className="flex-1" glow>
          <Sparkles size={16} />
          Save Entry
        </MagicButton>
      </div>
    </div>
  )
}
