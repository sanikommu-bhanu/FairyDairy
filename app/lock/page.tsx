"use client"

import { useEffect } from "react"
import { useAppStore } from "@/store/app-store"
import { FloatingParticles } from "@/components/ui/FloatingParticles"
import { PinLock } from "@/features/auth/PinLock"

export default function LockPage() {
  const { hydrate } = useAppStore()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return (
    <div className="min-h-screen relative">
      <FloatingParticles count={30} />
      <div className="relative z-10">
        <PinLock />
      </div>
    </div>
  )
}
