"use client"

import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"
import type { Entry, AppSettings, Mood } from "@/types"
import { loadEntries, saveEntries, loadSettings, saveSettings } from "@/lib/storage"
import { generateId, calculateStreak } from "@/lib/utils"
import { isSessionValid, destroySession } from "@/lib/auth"

interface AppState {
  // Data
  entries: Entry[]
  settings: AppSettings
  // UI State
  isLocked: boolean
  isHydrated: boolean
  currentMood: Mood | null
  selectedEntryId: string | null
  // Auth
  hydrate: () => void
  lock: () => void
  unlock: () => void
  // Entries CRUD
  addEntry: (data: Omit<Entry, "id" | "createdAt" | "updatedAt">) => Entry
  updateEntry: (id: string, data: Partial<Entry>) => void
  deleteEntry: (id: string) => void
  toggleFavorite: (id: string) => void
  // Settings
  updateSettings: (data: Partial<AppSettings>) => void
  clearAllData: () => void
  // UI
  setCurrentMood: (mood: Mood | null) => void
  setSelectedEntry: (id: string | null) => void
}

export const useAppStore = create<AppState>()(
  subscribeWithSelector((set, get) => ({
    entries: [],
    settings: {
      pinHash: null,
      hasOnboarded: false,
      animationsEnabled: true,
      theme: "dark",
      streakDays: 0,
      longestStreak: 0,
      lastEntryDate: null,
      reminderEnabled: false,
      reminderTime: "20:00",
    },
    isLocked: true,
    isHydrated: false,
    currentMood: null,
    selectedEntryId: null,

    hydrate: () => {
      const entries = loadEntries()
      const settings = loadSettings()
      const sessionValid = isSessionValid()
      const needsLock = settings.hasOnboarded && settings.pinHash && !sessionValid

      // Update streak info
      const streakInfo = calculateStreak(entries)
      const updatedSettings = {
        ...settings,
        streakDays: streakInfo.current,
        longestStreak: streakInfo.longest,
      }

      set({
        entries,
        settings: updatedSettings,
        isLocked: needsLock ? true : false,
        isHydrated: true,
      })
    },

    lock: () => {
      destroySession()
      set({ isLocked: true })
    },

    unlock: () => {
      set({ isLocked: false })
    },

    addEntry: (data) => {
      const now = new Date().toISOString()
      const entry: Entry = {
        ...data,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      }
      const entries = [entry, ...get().entries]
      saveEntries(entries)

      // Update streak
      const streakInfo = calculateStreak(entries)
      const settings = {
        ...get().settings,
        streakDays: streakInfo.current,
        longestStreak: streakInfo.longest,
        lastEntryDate: now.slice(0, 10),
      }
      saveSettings(settings)

      set({ entries, settings })
      return entry
    },

    updateEntry: (id, data) => {
      const entries = get().entries.map((e) =>
        e.id === id ? { ...e, ...data, updatedAt: new Date().toISOString() } : e
      )
      saveEntries(entries)
      set({ entries })
    },

    deleteEntry: (id) => {
      const entries = get().entries.filter((e) => e.id !== id)
      saveEntries(entries)
      set({ entries })
    },

    toggleFavorite: (id) => {
      const entries = get().entries.map((e) =>
        e.id === id ? { ...e, favorite: !e.favorite, updatedAt: new Date().toISOString() } : e
      )
      saveEntries(entries)
      set({ entries })
    },

    updateSettings: (data) => {
      const settings = { ...get().settings, ...data }
      saveSettings(settings)
      set({ settings })
    },

    clearAllData: () => {
      if (typeof window === "undefined") return
      localStorage.clear()
      sessionStorage.clear()
      set({
        entries: [],
        settings: {
          pinHash: null,
          hasOnboarded: false,
          animationsEnabled: true,
          theme: "dark",
          streakDays: 0,
          longestStreak: 0,
          lastEntryDate: null,
          reminderEnabled: false,
          reminderTime: "20:00",
        },
        isLocked: true,
      })
    },

    setCurrentMood: (mood) => set({ currentMood: mood }),
    setSelectedEntry: (id) => set({ selectedEntryId: id }),
  }))
)
