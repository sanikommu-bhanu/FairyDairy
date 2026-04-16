"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/store/app-store"
import { loadSettings } from "@/lib/storage"

export default function RootPage() {
  const router = useRouter()
  const { hydrate, isHydrated, settings, isLocked } = useAppStore()

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
    } else {
      router.replace("/home")
    }
  }, [isHydrated, isLocked, settings.hasOnboarded, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="text-5xl animate-pulse-soft">✨</div>
        <p className="text-fairy-text-muted text-sm">Loading your diary…</p>
      </div>
    </div>
  )
}
