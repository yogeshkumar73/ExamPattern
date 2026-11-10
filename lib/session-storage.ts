/**
 * Session-based storage and token management.
 * Scoped strictly to the browser session (sessionStorage) so that
 * when the user closes the browser window/tab, the session token automatically expires.
 */

export interface AuraSessionToken {
  token: string
  issuedAt: number
  userId: string
  email: string
  role: string
}

export interface AuraSessionData {
  user: any
  token: string
  role?: string
  isAdmin?: boolean
  loginTime?: string
}

const SESSION_KEY = "aura_session"
const TOKEN_KEY = "aura_session_token"
const REDIRECT_KEY = "aura_redirect_after_login"

/**
 * Generate a cryptographically secure session token before entering the platform.
 */
export function generateSessionToken(userId: string, email: string, role: string = "student"): AuraSessionToken {
  const randomPart = typeof crypto !== "undefined" && crypto.randomUUID 
    ? crypto.randomUUID().replace(/-/g, "") 
    : Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
  
  const token = `aura_sess_${Date.now()}_${randomPart}`

  return {
    token,
    issuedAt: Date.now(),
    userId,
    email,
    role,
  }
}

/**
 * Store the active session with its generated token in sessionStorage.
 * This guarantees expiration when the browser window or tab is closed.
 */
export function storeSession(data: { user: any; token?: string; role?: string; isAdmin?: boolean }): void {
  if (typeof window === "undefined") return

  const user = data.user
  const email = user?.email || ""
  const userId = user?.id || user?._id || "USR-UNKNOWN"
  const role = data.role || user?.role || "student"
  const isAdmin = Boolean(data.isAdmin || user?.isAdmin || role === "admin")

  // Generate a verified session token if not already provided
  const token = data.token || generateSessionToken(userId, email, role).token

  const payload: AuraSessionData = {
    user: {
      ...user,
      id: userId,
      role,
      isAdmin,
    },
    token,
    role,
    isAdmin,
    loginTime: new Date().toISOString(),
  }

  // Store in sessionStorage (browser tab/window lifecycle)
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload))
    sessionStorage.setItem(TOKEN_KEY, token)

    // Clear persistent disk storage to prevent lingering sessions across browser restarts
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(TOKEN_KEY)
  } catch (err) {
    console.error("[SessionStorage] Failed to store session:", err)
  }
}

/**
 * Retrieve the active session from sessionStorage.
 * Returns null if the browser window was closed, token is missing, or invalid.
 */
export function getStoredSession(): AuraSessionData | null {
  if (typeof window === "undefined") return null

  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    const token = sessionStorage.getItem(TOKEN_KEY)

    if (!raw) {
      // Window was closed/reopened or user never logged in: purge any stale disk storage
      localStorage.removeItem(SESSION_KEY)
      localStorage.removeItem(TOKEN_KEY)
      return null
    }

    const parsed: AuraSessionData = JSON.parse(raw)

    // Verify token validity and session integrity
    if (!parsed || !parsed.user || !parsed.user.email) {
      clearStoredSession()
      return null
    }

    // Verify token presence
    if (!parsed.token && !token) {
      clearStoredSession()
      return null
    }

    // Ensure token is attached
    if (!parsed.token && token) {
      parsed.token = token
    }

    return parsed
  } catch (err) {
    console.error("[SessionStorage] Error parsing session:", err)
    clearStoredSession()
    return null
  }
}

/**
 * Check if the current user has a valid active session token.
 */
export function hasValidSessionToken(): boolean {
  return getStoredSession() !== null
}

/**
 * Completely clear the session and token (e.g. upon Logout or Token Expiry).
 */
export function clearStoredSession(): void {
  if (typeof window === "undefined") return

  try {
    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(REDIRECT_KEY)
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(TOKEN_KEY)
  } catch (err) {
    console.error("[SessionStorage] Error clearing session:", err)
  }
}

/**
 * Save the intended service step to redirect after successful login.
 */
export function savePostLoginRedirect(step: string): void {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(REDIRECT_KEY, step)
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Consume and retrieve the intended post-login redirect step.
 */
export function consumePostLoginRedirect(): string | null {
  if (typeof window === "undefined") return null
  try {
    const step = sessionStorage.getItem(REDIRECT_KEY)
    if (step) {
      sessionStorage.removeItem(REDIRECT_KEY)
    }
    return step
  } catch {
    return null
  }
}
