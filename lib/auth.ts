const PIN_KEY = "fairy_pin_hash"
const PIN_LENGTH_KEY = "fairy_pin_length"
const SESSION_KEY = "fairy_session"
const LOCK_STATE_KEY = "fairy_lock_state"
const SESSION_DURATION = 30 * 60 * 1000 // 30 minutes

interface LockState {
  failedAttempts: number
  cooldownUntil: number
}

const DEFAULT_LOCK_STATE: LockState = {
  failedAttempts: 0,
  cooldownUntil: 0,
}

export async function hashPIN(pin: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(pin + "fairy_salt_2024")
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export async function setPIN(pin: string, pinLength: 4 | 6 = pin.length === 6 ? 6 : 4): Promise<void> {
  const hash = await hashPIN(pin)
  localStorage.setItem(PIN_KEY, hash)
  localStorage.setItem(PIN_LENGTH_KEY, String(pinLength))
  clearLockState()
}

export async function verifyPIN(pin: string): Promise<boolean> {
  const stored = localStorage.getItem(PIN_KEY)
  if (!stored) return false
  const requiredLength = getPINLength()
  if (pin.length !== requiredLength) return false
  const hash = await hashPIN(pin)
  return stored === hash
}

export function hasPIN(): boolean {
  return !!localStorage.getItem(PIN_KEY)
}

export function removePIN(): void {
  localStorage.removeItem(PIN_KEY)
  localStorage.removeItem(PIN_LENGTH_KEY)
  clearLockState()
}

export function getPINLength(): 4 | 6 {
  const raw = localStorage.getItem(PIN_LENGTH_KEY)
  return raw === "6" ? 6 : 4
}

export function getLockState(): LockState {
  try {
    const raw = localStorage.getItem(LOCK_STATE_KEY)
    if (!raw) return DEFAULT_LOCK_STATE
    const parsed = JSON.parse(raw) as Partial<LockState>
    return {
      failedAttempts: Math.max(0, Number(parsed.failedAttempts) || 0),
      cooldownUntil: Math.max(0, Number(parsed.cooldownUntil) || 0),
    }
  } catch {
    return DEFAULT_LOCK_STATE
  }
}

function saveLockState(state: LockState): void {
  localStorage.setItem(LOCK_STATE_KEY, JSON.stringify(state))
}

export function clearLockState(): void {
  localStorage.removeItem(LOCK_STATE_KEY)
}

export function getRemainingCooldownMs(): number {
  const state = getLockState()
  return Math.max(0, state.cooldownUntil - Date.now())
}

function getCooldownSeconds(attempts: number): number {
  if (attempts >= 10) return 300
  if (attempts >= 8) return 120
  if (attempts >= 5) return 30
  return 0
}

export function registerFailedPINAttempt(): LockState {
  const state = getLockState()
  const failedAttempts = state.failedAttempts + 1
  const cooldownSeconds = getCooldownSeconds(failedAttempts)
  const nextState: LockState = {
    failedAttempts,
    cooldownUntil: cooldownSeconds > 0 ? Date.now() + cooldownSeconds * 1000 : 0,
  }
  saveLockState(nextState)
  return nextState
}

export function registerSuccessfulPINEntry(): void {
  clearLockState()
}

export async function requestBiometricUnlock(): Promise<boolean> {
  // Placeholder for future WebAuthn/biometric integration.
  return false
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

export function clearAuthData(): void {
  removePIN()
  destroySession()
}
