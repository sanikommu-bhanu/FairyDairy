import type { Entry, AppSettings, Media } from "@/types"

const ENTRIES_KEY = "fairy_entries"
const SETTINGS_KEY = "fairy_settings"
const DB_NAME = "fairydiary_db"
const DB_VERSION = 1
const MEDIA_STORE = "media"

// ─── Entries ─────────────────────────────────────────────────
export function loadEntries(): Entry[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(ENTRIES_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Entry[]
  } catch {
    return []
  }
}

export function saveEntries(entries: Entry[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries))
  } catch (e) {
    console.error("Failed to save entries:", e)
  }
}

// ─── Settings ─────────────────────────────────────────────────
export const DEFAULT_SETTINGS: AppSettings = {
  pinHash: null,
  hasOnboarded: false,
  animationsEnabled: true,
  theme: "dark",
  streakDays: 0,
  longestStreak: 0,
  lastEntryDate: null,
  reminderEnabled: false,
  reminderTime: "20:00",
}

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch (e) {
    console.error("Failed to save settings:", e)
  }
}

export function clearAllData(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(ENTRIES_KEY)
  localStorage.removeItem(SETTINGS_KEY)
  localStorage.removeItem("fairy_pin_hash")
}

// ─── IndexedDB Media ─────────────────────────────────────────
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(MEDIA_STORE)) {
        db.createObjectStore(MEDIA_STORE, { keyPath: "id" })
      }
    }
  })
}

export async function saveMedia(media: Media): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MEDIA_STORE, "readwrite")
    tx.objectStore(MEDIA_STORE).put(media)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function loadMedia(id: string): Promise<Media | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MEDIA_STORE, "readonly")
    const req = tx.objectStore(MEDIA_STORE).get(id)
    req.onsuccess = () => resolve(req.result || null)
    req.onerror = () => reject(req.error)
  })
}

export async function loadAllMedia(): Promise<Media[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MEDIA_STORE, "readonly")
    const req = tx.objectStore(MEDIA_STORE).getAll()
    req.onsuccess = () => resolve(req.result || [])
    req.onerror = () => reject(req.error)
  })
}

export async function deleteMedia(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MEDIA_STORE, "readwrite")
    tx.objectStore(MEDIA_STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
