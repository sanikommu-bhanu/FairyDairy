"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/store/app-store"
import { BottomNav } from "@/components/layout/BottomNav"
import { FloatingParticles } from "@/components/ui/FloatingParticles"
import { ToastContainer } from "@/components/ui/Toast"
import { loadSettings } from "@/lib/storage"
import { refreshSession } from "@/lib/auth"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { hydrate, isHydrated, isLocked, settings } = useAppStore()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    if (!isHydrated) return
    const s = loadSettings()
    if (!s.hasOnboarded) {
      router.replace("/onboarding")
    } else if (isLocked) {
      router.replace("/lock")
    }
  }, [isHydrated, isLocked, router])

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
      {settings.animationsEnabled && <FloatingParticles count={25} />}
      <div className="relative z-10 pb-24">
        {children}
      </div>
      <BottomNav />
      <ToastContainer />
    </div>
  )
}
