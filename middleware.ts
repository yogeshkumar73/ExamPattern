/**
 * Next.js Edge Middleware — Global Rate Limiting & Security Gate
 *
 * Runs on the Edge runtime BEFORE any API route handler.
 * Applies tiered rate limits per route category and blocks
 * obvious bot/attack traffic.
 *
 * Rate limit tiers (per IP):
 *  - Auth routes     : 5  req / 60s   (login, register)
 *  - Write routes    : 20 req / 60s   (POST/PUT/DELETE profile, users, arena)
 *  - Admin routes    : 30 req / 60s   (admin-specific APIs)
 *  - Read routes     : 60 req / 60s   (GET profile, arena-status, etc.)
 *  - Static/other    : no limit
 *
 * Also adds global security headers to every response.
 */

import { NextResponse, type NextRequest } from "next/server";

// ─── In-Edge sliding window rate limiter ─────────────────────────────────────
// Edge runtime cannot import Node.js modules, so we use a simple Map here.
// This Map resets per cold-start but still provides meaningful burst protection.

interface RateEntry {
  timestamps: number[];
}

const edgeStore = new Map<string, RateEntry>();

function edgeRateLimit(
  key: string,
  max: number,
  windowMs: number
): { allowed: boolean; resetIn: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  const entry = edgeStore.get(key) ?? { timestamps: [] };
  entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

  if (entry.timestamps.length >= max) {
    const oldest = entry.timestamps[0];
    const resetIn = Math.ceil((oldest + windowMs - now) / 1000);
    edgeStore.set(key, entry);
    return { allowed: false, resetIn };
  }

  entry.timestamps.push(now);
  edgeStore.set(key, entry);

  // Periodic cleanup (~1% of requests) to prevent unbounded memory growth
  if (Math.random() < 0.01) {
    for (const [k, v] of edgeStore.entries()) {
      if (!v.timestamps.some((t) => t > now - windowMs * 2)) {
        edgeStore.delete(k);
      }
    }
  }

  return { allowed: true, resetIn: 0 };
}

// ─── IP Extraction ────────────────────────────────────────────────────────────

function extractIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

// ─── Bot UA detection (lightweight — no regex with backtracks) ────────────────

const BOT_UA_TOKENS = [
  "sqlmap", "nikto", "masscan", "zgrab", "nmap",
  "dirbuster", "acunetix", "havij", "openvas",
  "metasploit", "zgrab2",
];

function isBotUa(ua: string): boolean {
  if (!ua || ua.length < 5) return true;
  const lower = ua.toLowerCase();
  return BOT_UA_TOKENS.some((token) => lower.includes(token));
}

// ─── Route classification ─────────────────────────────────────────────────────

type RouteCategory = "auth" | "admin" | "write" | "read";

interface RateConfig {
  max: number;
  windowMs: number;
}

const RATE_CONFIGS: Record<RouteCategory, RateConfig> = {
  auth:  { max: 5,  windowMs: 60_000 },   // 5  req/min
  admin: { max: 30, windowMs: 60_000 },   // 30 req/min
  write: { max: 20, windowMs: 60_000 },   // 20 req/min
  read:  { max: 60, windowMs: 60_000 },   // 60 req/min
};

function classifyRoute(pathname: string, method: string): RouteCategory | null {
  // Auth routes — tightest limit
  if (
    pathname.startsWith("/api/auth/") ||
    pathname === "/api/admin/login"
  ) {
    return "auth";
  }

  // Admin routes
  if (pathname.startsWith("/api/admin/")) {
    return "admin";
  }

  // Mutating non-auth routes
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    return "write";
  }

  // Read-only API routes
  if (pathname.startsWith("/api/")) {
    return "read";
  }

  // Non-API (pages, assets) — no rate limit
  return null;
}

// ─── Security headers to add to ALL responses ─────────────────────────────────

function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  return res;
}

// ─── Middleware entry point ───────────────────────────────────────────────────

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method?.toUpperCase() ?? "GET";

  // --- 1. Bot User-Agent block ---
  const ua = req.headers.get("user-agent") ?? "";
  if (isBotUa(ua)) {
    return new NextResponse(
      JSON.stringify({ message: "Forbidden: automated requests not allowed" }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // --- 2. Route classification & rate limiting ---
  const category = classifyRoute(pathname, method);

  if (category) {
    const ip = extractIp(req);
    const config = RATE_CONFIGS[category];
    const key = `${category}:${ip}`;

    const { allowed, resetIn } = edgeRateLimit(key, config.max, config.windowMs);

    if (!allowed) {
      const res = new NextResponse(
        JSON.stringify({
          message: `Too many requests. Please slow down.`,
          retryAfter: resetIn,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(resetIn),
            "X-RateLimit-Limit": String(config.max),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(Date.now() / 1000) + resetIn),
          },
        }
      );
      return applySecurityHeaders(res);
    }

    // Attach rate limit info headers to passing requests
    const res = NextResponse.next();
    res.headers.set("X-RateLimit-Limit", String(config.max));
    res.headers.set("X-RateLimit-Category", category);
    return applySecurityHeaders(res);
  }

  // --- 3. Non-API routes — just add security headers ---
  const res = NextResponse.next();
  return applySecurityHeaders(res);
}

// ─── Matcher config — run on all routes except Next.js internals ──────────────

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot)).*)",
  ],
};
