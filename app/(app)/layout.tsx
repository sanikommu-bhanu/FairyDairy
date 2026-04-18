"use client"

import { useEffect } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/store/app-store"
import { BottomNav } from "@/components/layout/BottomNav"
import { FloatingParticles } from "@/components/ui/FloatingParticles"
import { ToastContainer } from "@/components/ui/Toast"
import { refreshSession } from "@/lib/auth"
import { applyTheme } from "@/lib/theme"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { hydrate, isHydrated, isLocked, settings } = useAppStore()
  const [showParticles, setShowParticles] = useState(false)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    if (!isHydrated) return
    if (!settings.hasOnboarded) {
      router.replace("/onboarding")
    } else if (isLocked) {
      router.replace("/lock")
    }
  }, [isHydrated, isLocked, settings.hasOnboarded, router])

  useEffect(() => {
    if (!isHydrated) return
    applyTheme(settings.theme)
  }, [isHydrated, settings.theme])

  useEffect(() => {
    if (!isHydrated || !settings.animationsEnabled) {
      setShowParticles(false)
      return
    }

    const onIdle =
      "requestIdleCallback" in window
        ? (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback
        : null

    if (onIdle) {
      const id = onIdle(() => setShowParticles(true), { timeout: 700 })
      return () => {
        if ("cancelIdleCallback" in window) {
          ;(window as Window & { cancelIdleCallback: (idleId: number) => void }).cancelIdleCallback(id)
        }
      }
    }

    const timer = window.setTimeout(() => setShowParticles(true), 350)
    return () => window.clearTimeout(timer)
  }, [isHydrated, settings.animationsEnabled])

  // Refresh session on activity
  useEffect(() => {
    const onActivity = () => refreshSession()
    window.addEventListener("click", onActivity)
    window.addEventListener("keydown", onActivity)
    return () => {
      window.removeEventListener("click", onActivity)
      window.removeEventListener("keydown", onActivity)
    }
  }, [])

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-4xl animate-pulse-soft">✨</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      {showParticles && <FloatingParticles count={18} />}
      <div className="relative z-10 pb-24">
        {children}
      </div>
      <BottomNav />
      <ToastContainer />
    </div>
  )
}
