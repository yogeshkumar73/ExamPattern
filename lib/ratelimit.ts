/**
 * In-memory sliding window rate limiter.
 * Works without any external Redis/Upstash setup.
 * Falls back gracefully on any error — never blocks the app.
 */

interface WindowEntry {
  timestamps: number[]
}

type Store = Map<string, WindowEntry>

// Persist across Next.js hot-reloads
const g = global as typeof globalThis & { __rateLimitStore?: Store }
if (!g.__rateLimitStore) {
  g.__rateLimitStore = new Map<string, WindowEntry>()
}
const store: Store = g.__rateLimitStore

/**
 * Check if a given key (e.g. IP or userId) is within the allowed limit.
 * @param key       Unique identifier (IP address or user ID)
 * @param max       Maximum requests allowed in the window
 * @param windowMs  Window duration in milliseconds
 * @returns { allowed, remaining, resetIn }
 */
export function checkRateLimit(
  key: string,
  max: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetIn: number } {
  try {
    const now = Date.now()
    const windowStart = now - windowMs

    const entry = store.get(key) ?? { timestamps: [] }

    // Evict old timestamps outside the window
    entry.timestamps = entry.timestamps.filter((t) => t > windowStart)

    const count = entry.timestamps.length

    if (count >= max) {
      const oldest = entry.timestamps[0]
      const resetIn = Math.ceil((oldest + windowMs - now) / 1000)
      store.set(key, entry)
      return { allowed: false, remaining: 0, resetIn }
    }

    entry.timestamps.push(now)
    store.set(key, entry)

    // Cleanup keys older than 2× the window to prevent memory leaks
    if (Math.random() < 0.01) {
      for (const [k, v] of store.entries()) {
        const stillActive = v.timestamps.some((t) => t > now - windowMs * 2)
        if (!stillActive) store.delete(k)
      }
    }

    return { allowed: true, remaining: max - (count + 1), resetIn: 0 }
  } catch {
    // Never block on rate-limiter errors
    return { allowed: true, remaining: 1, resetIn: 0 }
  }
}

/**
 * Helper: Get client IP from a NextRequest or standard Request
 */
export function getClientIp(req: Request): string {
  try {
    const forwarded = req.headers.get("x-forwarded-for")
    if (forwarded) return forwarded.split(",")[0].trim()
    return "anonymous"
  } catch {
    return "anonymous"
  }
}
