"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/store/app-store"
import { FloatingParticles } from "@/components/ui/FloatingParticles"
import { PinLock } from "@/features/auth/PinLock"
import { applyTheme } from "@/lib/theme"

export default function LockPage() {
  const router = useRouter()
  const { hydrate, isHydrated, isLocked, settings } = useAppStore()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    if (!isHydrated) return
    applyTheme(settings.theme)
    if (!settings.hasOnboarded) {
      router.replace("/onboarding")
      return
    }
    if (!isLocked) {
      router.replace("/home")
    }
  }, [isHydrated, isLocked, settings.hasOnboarded, settings.theme, router])

  return (
    <div className="min-h-screen relative">
      <FloatingParticles count={30} />
      <div className="relative z-10">
        <PinLock />
      </div>
    </div>
  )
}
