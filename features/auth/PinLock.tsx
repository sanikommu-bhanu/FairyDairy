"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/store/app-store"
import {
  verifyPIN,
  createSession,
  getRemainingCooldownMs,
  registerFailedPINAttempt,
  registerSuccessfulPINEntry,
  requestBiometricUnlock,
} from "@/lib/auth"
import { cn } from "@/lib/utils"
import { ArrowLeft, Fingerprint, Lock } from "lucide-react"
import { showToast } from "@/components/ui/Toast"

export function PinLock() {
  const router = useRouter()
  const { unlock, settings } = useAppStore()
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [attempts, setAttempts] = useState(0)
  const [shaking, setShaking] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [cooldownMs, setCooldownMs] = useState(0)

  const requiredLength = settings.pinLength

  useEffect(() => {
    setAttempts(0)
    setCooldownMs(getRemainingCooldownMs())
  }, [])

  useEffect(() => {
    if (cooldownMs <= 0) return
    const timer = window.setInterval(() => {
      setCooldownMs(getRemainingCooldownMs())
    }, 250)
    return () => window.clearInterval(timer)
  }, [cooldownMs])

  useEffect(() => {
    if (pin.length === requiredLength && !shaking && !isVerifying && cooldownMs <= 0) {
      handleVerify()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin, requiredLength, shaking, isVerifying, cooldownMs])

  const handleVerify = async () => {
    if (pin.length !== requiredLength || isVerifying) return
    setIsVerifying(true)
    const valid = await verifyPIN(pin)
    if (valid) {
      registerSuccessfulPINEntry()
      createSession()
      unlock()
      router.replace("/home")
    } else {
      const lockState = registerFailedPINAttempt()
      setShaking(true)
      setError("Wrong PIN — try again")
      setAttempts(lockState.failedAttempts)
      setCooldownMs(getRemainingCooldownMs())
      setTimeout(() => {
        setPin("")
        setError("")
        setShaking(false)
      }, 600)
    }
    setIsVerifying(false)
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
      return
    }
    router.replace("/home")
  }

  const onDigit = (digit: number) => {
    if (cooldownMs > 0 || isVerifying) return
    setError("")
    setPin((prev) => (prev.length >= requiredLength ? prev : prev + String(digit)))
  }

  const onDelete = () => {
    if (cooldownMs > 0 || isVerifying) return
    setError("")
    setPin((prev) => prev.slice(0, -1))
  }

  const onBiometricPlaceholder = async () => {
    const ok = await requestBiometricUnlock()
    if (!ok) {
      showToast("Biometric unlock coming soon", "info")
    }
  }

  const cooldownLabel = useMemo(() => {
    const seconds = Math.ceil(cooldownMs / 1000)
    if (seconds <= 0) return ""
    return `Too many attempts. Try again in ${seconds}s`
  }, [cooldownMs])

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

      <button
        type="button"
        onClick={handleBack}
        className="absolute top-6 left-4 z-20 glass rounded-xl px-3 py-2 text-fairy-text-muted hover:text-fairy-text flex items-center gap-2"
      >
        <ArrowLeft size={16} />
        Back
      </button>

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
          <p className="text-fairy-text-muted/70 text-xs mt-2">
            Enter your {requiredLength}-digit PIN
          </p>
        </div>

        {/* PIN dots */}
        <div className="flex gap-4">
          {Array.from({ length: requiredLength }).map((_, i) => (
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
              {attempts >= 5 && " (forgotten your PIN? Reset from Settings)"}
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {cooldownMs > 0 && (
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-amber-300 text-xs -mt-4"
            >
              {cooldownLabel}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 w-full relative z-30">
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
                  (cooldownMs > 0 || isVerifying) && "opacity-50 pointer-events-none",
                )}
                onClick={() => {
                  if (key === "del") {
                    onDelete()
                  } else {
                    onDigit(Number(key))
                  }
                }}
              >
                {key === "del" ? "⌫" : key}
              </motion.button>
            )
          })}
        </div>

        <div className="w-full flex items-center gap-3">
          <button
            type="button"
            onClick={onBiometricPlaceholder}
            className="flex-1 glass rounded-xl py-3 text-sm text-fairy-text-muted hover:text-fairy-text flex items-center justify-center gap-2"
          >
            <Fingerprint size={15} />
            Biometric
          </button>
          <div className="flex-1 glass rounded-xl py-3 text-xs text-fairy-text-muted/80 flex items-center justify-center gap-2">
            <Lock size={14} />
            {attempts} failed attempts
          </div>
        </div>
      </motion.div>
    </div>
  )
}
