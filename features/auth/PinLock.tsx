"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/store/app-store"
import { verifyPIN, createSession } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { Vibrate } from "lucide-react"

export function PinLock() {
  const router = useRouter()
  const { unlock, settings } = useAppStore()
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [attempts, setAttempts] = useState(0)
  const [shaking, setShaking] = useState(false)

  const maxPinLength = 6

  useEffect(() => {
   if (pin.length === 4 && !shaking) { 
      handleVerify()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin])

  const handleVerify = async () => {
    const valid = await verifyPIN(pin)
    if (valid) {
      createSession()
      unlock()
      router.replace("/home")
    } else {
      setShaking(true)
      setError("Wrong PIN — try again")
      setAttempts((a) => a + 1)
      setTimeout(() => {
        setPin("")
        setError("")
        setShaking(false)
      }, 600)
    }
  }

  const greeting = new Date().getHours() < 12
    ? "Good morning ☀️"
    : new Date().getHours() < 17
    ? "Good afternoon 🌸"
    : new Date().getHours() < 21
    ? "Good evening 🌙"
    : "Hello, night owl 🌟"

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-fairy-glow opacity-40 pointer-events-none" />

      <motion.div
        animate={shaking ? {
          x: [-10, 10, -10, 10, -8, 8, -5, 5, 0],
        } : { x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xs z-10 flex flex-col items-center space-y-8"
      >
        {/* Logo */}
        <div className="text-center">
          <motion.div
            className="text-5xl mb-3"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            🧚‍♀️
          </motion.div>
          <h1 className="font-display text-2xl font-bold gradient-text">FairyDiary</h1>
          <p className="text-fairy-text-muted text-sm mt-1">{greeting}</p>
          {settings.displayName && (
            <p className="text-fairy-text text-lg mt-1 font-display">
              Welcome back, {settings.displayName}
            </p>
          )}
        </div>

        {/* PIN dots */}
        <div className="flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={i}
              animate={i < pin.length ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.15 }}
              className={cn(
                "w-5 h-5 rounded-full border-2 transition-all duration-200",
                i < pin.length
                  ? "bg-gradient-to-r from-fairy-purple to-fairy-rose border-transparent shadow-[0_0_12px_rgba(192,132,252,0.7)]"
                  : "border-fairy-border bg-white/5"
              )}
            />
          ))}
        </div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-red-400 text-sm -mt-4"
            >
              {error}
              {attempts >= 5 && " (forgotten your PIN? Clear app data in Settings)"}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "del"].map((key, i) => {
            if (key === null) return <div key={i} />
            return (
              <motion.button
                key={i}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.85 }}
                className={cn(
                  "h-16 rounded-2xl glass flex items-center justify-center text-2xl font-medium",
                  key === "del" ? "text-fairy-rose text-xl" : "text-fairy-text hover:bg-fairy-purple/20",
                )}
                onClick={() => {
                  if (key === "del") {
                    setPin((p) => p.slice(0, -1))
                    setError("")
                  } else if (pin.length < maxPinLength) {
                    setPin((p) => p + key.toString())
                  }
                }}
              >
                {key === "del" ? "⌫" : key}
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
