const PIN_KEY = "fairy_pin_hash"
const SESSION_KEY = "fairy_session"
const SESSION_DURATION = 30 * 60 * 1000 // 30 minutes

export async function hashPIN(pin: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(pin + "fairy_salt_2024")
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export async function setPIN(pin: string): Promise<void> {
  const hash = await hashPIN(pin)
  localStorage.setItem(PIN_KEY, hash)
}

export async function verifyPIN(pin: string): Promise<boolean> {
  const stored = localStorage.getItem(PIN_KEY)
  if (!stored) return false
  const hash = await hashPIN(pin)
  return stored === hash
}

export function hasPIN(): boolean {
  return !!localStorage.getItem(PIN_KEY)
}

export function removePIN(): void {
  localStorage.removeItem(PIN_KEY)
}

export function createSession(): void {
  const session = {
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION,
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function isSessionValid(): boolean {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return false
    const session = JSON.parse(raw)
    return Date.now() < session.expiresAt
  } catch {
    return false
  }
}

export function refreshSession(): void {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return
    const session = JSON.parse(raw)
    session.expiresAt = Date.now() + SESSION_DURATION
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {}
}

export function destroySession(): void {
  sessionStorage.removeItem(SESSION_KEY)
}

export function getPINHash(): string | null {
  return localStorage.getItem(PIN_KEY)
}
