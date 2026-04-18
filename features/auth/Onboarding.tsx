"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/store/app-store"
import { setPIN } from "@/lib/auth"
import { createSession } from "@/lib/auth"
import { MagicButton } from "@/components/ui/MagicButton"
import { cn } from "@/lib/utils"
import type { PinLength } from "@/types"

const STEPS = ["welcome", "name", "pin", "confirm", "done"] as const
type Step = (typeof STEPS)[number]

export function Onboarding() {
  const router = useRouter()
  const { updateSettings, unlock } = useAppStore()
  const [step, setStep] = useState<Step>("welcome")
  const [name, setName] = useState("")
  const [pin, setPin] = useState("")
  const [confirm, setConfirm] = useState("")
  const [pinLength, setPinLength] = useState<PinLength>(4)
  const [pinError, setPinError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const stepIndex = STEPS.indexOf(step)

  const handleNext = async () => {
    if (step === "welcome") { setStep("name"); return }
    if (step === "name") { setStep("pin"); return }
    if (step === "pin") {
      if (pin.length !== pinLength) { setPinError(`Please enter a ${pinLength}-digit PIN`); return }
      setPinError("")
      setStep("confirm")
      return
    }
    if (step === "confirm") {
      if (confirm !== pin) {
        setPinError("PINs do not match — try again")
        setConfirm("")
        return
      }
      setIsLoading(true)
      await setPIN(pin, pinLength)
      const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pin + "fairy_salt_2024"))
      const hashHex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,"0")).join("")
      updateSettings({
        hasOnboarded: true,
        pinHash: hashHex,
        pinLength,
        displayName: name || undefined,
      })
      createSession()
      unlock()
      setIsLoading(false)
      setStep("done")
      return
    }
    if (step === "done") {
      router.replace("/home")
      return
    }
  }

  const handleSkipPin = async () => {
    updateSettings({ hasOnboarded: true, pinHash: null, displayName: name || undefined })
    createSession()
    unlock()
    router.replace("/home")
  }

  const variants = {
    enter: { opacity: 0, x: 40, scale: 0.96 },
    center: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -40, scale: 0.96 },
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-fairy-glow opacity-60 pointer-events-none" />

      {/* Progress dots */}
      <div className="flex gap-2 mb-10 z-10">
        {STEPS.slice(0, -1).map((s, i) => (
          <motion.div
            key={s}
            className={cn(
              "rounded-full transition-all duration-500",
              i <= stepIndex - 0
                ? "bg-fairy-purple w-6 h-2"
                : "bg-white/10 w-2 h-2"
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="w-full max-w-sm z-10 flex flex-col items-center"
        >
          {step === "welcome" && (
            <div className="text-center space-y-6">
              <motion.div
                className="text-8xl mb-4"
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                🧚‍♀️
              </motion.div>
              <div>
                <h1 className="font-display text-4xl font-bold gradient-text mb-3">
                  FairyDiary
                </h1>
                <p className="text-fairy-text-muted text-lg leading-relaxed">
                  Your magical, private space to write, reflect, and grow.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-6">
                {["✨ AI Writing", "🔒 Private", "📊 Insights", "🌙 Daily Moods"].map((f) => (
                  <div key={f} className="glass rounded-xl px-3 py-2 text-sm text-fairy-text-muted text-center">
                    {f}
                  </div>
                ))}
              </div>
              <MagicButton size="lg" className="w-full mt-4" onClick={handleNext}>
                Begin Your Story ✨
              </MagicButton>
            </div>
          )}

          {step === "name" && (
            <div className="text-center space-y-6 w-full">
              <div className="text-6xl">🌸</div>
              <div>
                <h2 className="font-display text-3xl font-bold text-fairy-text mb-2">
                  What should I call you?
                </h2>
                <p className="text-fairy-text-muted">Your diary will greet you by name</p>
              </div>
              <input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={30}
                className="w-full glass rounded-xl px-4 py-3.5 text-fairy-text placeholder-fairy-text-muted/50 text-center text-lg focus:outline-none focus:border-fairy-purple/50 border border-fairy-border"
                onKeyDown={(e) => e.key === "Enter" && handleNext()}
              />
              <MagicButton size="lg" className="w-full" onClick={handleNext}>
                Continue
              </MagicButton>
            </div>
          )}

          {step === "pin" && (
            <div className="text-center space-y-6 w-full">
              <div className="text-6xl">🔒</div>
              <div>
                <h2 className="font-display text-3xl font-bold text-fairy-text mb-2">
                  Create your PIN
                </h2>
                <p className="text-fairy-text-muted text-sm">
                  Choose a secure 4-digit or 6-digit PIN
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full">
                {[4, 6].map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => {
                      setPinLength(len as PinLength)
                      setPin("")
                      setConfirm("")
                      setPinError("")
                    }}
                    className={cn(
                      "glass rounded-xl py-2 text-sm border",
                      pinLength === len ? "border-fairy-purple text-fairy-purple" : "border-fairy-border text-fairy-text-muted"
                    )}
                  >
                    {len}-digit PIN
                  </button>
                ))}
              </div>
              <PinInput value={pin} onChange={setPin} error={pinError} maxLength={pinLength} />
              {pinError && (
                <p className="text-red-400 text-sm">{pinError}</p>
              )}
              <MagicButton size="lg" className="w-full" onClick={handleNext} disabled={pin.length !== pinLength}>
                Set PIN
              </MagicButton>
              <button
                onClick={handleSkipPin}
                className="text-fairy-text-muted text-sm underline underline-offset-2"
              >
                Skip for now
              </button>
            </div>
          )}

          {step === "confirm" && (
            <div className="text-center space-y-6 w-full">
              <div className="text-6xl">✅</div>
              <div>
                <h2 className="font-display text-3xl font-bold text-fairy-text mb-2">
                  Confirm your PIN
                </h2>
                <p className="text-fairy-text-muted text-sm">Enter the same {pinLength}-digit PIN again</p>
              </div>
              <PinInput value={confirm} onChange={setConfirm} error={pinError} maxLength={pinLength} />
              {pinError && (
                <p className="text-red-400 text-sm">{pinError}</p>
              )}
              <MagicButton size="lg" className="w-full" onClick={handleNext} loading={isLoading} disabled={confirm.length !== pinLength}>
                Confirm
              </MagicButton>
            </div>
          )}

          {step === "done" && (
            <div className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="text-8xl"
              >
                🌟
              </motion.div>
              <div>
                <h2 className="font-display text-3xl font-bold gradient-text mb-3">
                  {name ? `Welcome, ${name}!` : "Welcome!"}
                </h2>
                <p className="text-fairy-text-muted leading-relaxed">
                  Your magical diary is ready. Write your first entry and begin your story.
                </p>
              </div>
              <MagicButton size="lg" className="w-full" onClick={handleNext} glow>
                Open My Diary ✨
              </MagicButton>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// PIN input component
function PinInput({
  value,
  onChange,
  error,
  maxLength = 6,
}: {
  value: string
  onChange: (v: string) => void
  error?: string
  maxLength?: number
}) {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Dots */}
      <div className="flex gap-3">
        {Array.from({ length: maxLength }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-4 h-4 rounded-full border-2 transition-all duration-200",
              i < value.length
                ? "bg-gradient-to-r from-fairy-purple to-fairy-rose border-transparent shadow-[0_0_10px_rgba(192,132,252,0.6)]"
                : "border-fairy-border bg-white/5"
            )}
          />
        ))}
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[240px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "del"].map((key, i) => {
          if (key === null) return <div key={i} />
          return (
            <motion.button
              key={i}
              type="button"
              whileTap={{ scale: 0.85 }}
              className={cn(
                "h-14 rounded-2xl glass flex items-center justify-center text-xl font-medium text-fairy-text",
                key === "del" ? "text-fairy-rose" : "hover:bg-fairy-purple/20",
                error && "border-red-500/30"
              )}
              onClick={() => {
                if (key === "del") {
                  onChange(value.slice(0, -1))
                } else if (value.length < maxLength) {
                  onChange(value + key.toString())
                }
              }}
            >
              {key === "del" ? "⌫" : key}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
