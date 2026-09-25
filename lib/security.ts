/**
 * Security Middleware Library
 * Provides: CSRF protection, input sanitization, bot/faker detection,
 * honeypot detection, request body size limits, header validation,
 * and suspicious request flagging.
 */

import { NextResponse } from "next/server";

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_BODY_SIZE_BYTES = 1 * 1024 * 1024;  // 1 MB default
const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB for file uploads

// Known bad User-Agent patterns (bots, scanners, exploit tools)
const BLOCKED_UA_PATTERNS = [
  /sqlmap/i,
  /nikto/i,
  /masscan/i,
  /zgrab/i,
  /nmap/i,
  /dirbuster/i,
  /acunetix/i,
  /burpsuite/i,
  /havij/i,
  /openvas/i,
  /metasploit/i,
  /python-requests\/[01]\./i,  // very old python-requests
  /go-http-client\/1\.1/i,
  /curl\/[567]\./i,             // old curl (scanners often use old versions)
];

// Honeypot field names — if any of these appear in request body, it's a bot
const HONEYPOT_FIELDS = [
  "website",
  "url",
  "homepage",
  "fax",
  "company_name",
  "phone2",
  "address2",
  "h_field",
  "trap",
  "_trap",
  "_gotcha",
];

// Suspicious header patterns indicating attack tools
const SUSPICIOUS_HEADER_VALUES = [
  "<script",
  "javascript:",
  "vbscript:",
  "onload=",
  "onerror=",
  "eval(",
  "document.cookie",
  "../",
  "..\\",
  "%2e%2e",
  "union select",
  "drop table",
  "insert into",
  "'; --",
  "0x",
];

// ─── CSRF Token Helpers ──────────────────────────────────────────────────────

/**
 * Generate a CSRF token (for use in forms / API calls).
 * Uses crypto.randomUUID() — available in Node 18+ and all modern browsers.
 */
export function generateCsrfToken(): string {
  return crypto.randomUUID();
}

/**
 * Validate CSRF token from request headers.
 * Implements double-submit cookie pattern:
 *   - Cookie: csrf_token=<value>
 *   - Header: X-CSRF-Token: <same value>
 */
export function validateCsrfToken(req: Request): boolean {
  try {
    const headerToken = req.headers.get("x-csrf-token");
    const cookieHeader = req.headers.get("cookie") ?? "";

    // Parse csrf_token from cookie string
    const cookieToken = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("csrf_token="))
      ?.split("=")[1]
      ?.trim();

    if (!headerToken || !cookieToken) return false;

    // Constant-time comparison to prevent timing attacks
    return timingSafeEqual(headerToken, cookieToken);
  } catch {
    return false;
  }
}

/**
 * Constant-time string comparison (prevents timing side-channel attacks).
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// ─── IP Extraction ───────────────────────────────────────────────────────────

/**
 * Safely extract real client IP, handling X-Forwarded-For chains.
 * Never trusts the raw header without validation.
 */
export function getClientIpSafe(req: Request): string {
  try {
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) {
      // Take the LAST IP in chain (most trustworthy in reverse-proxy setups)
      // or FIRST if you trust your proxy. We take first (typical for most setups).
      const firstIp = forwarded.split(",")[0].trim();
      // Validate it's an IP-like string (basic check)
      if (/^[\d.]{7,15}$/.test(firstIp) || /^[0-9a-f:]{3,45}$/i.test(firstIp)) {
        return firstIp;
      }
    }

    const realIp = req.headers.get("x-real-ip");
    if (realIp) return realIp.trim();

    return "0.0.0.0";
  } catch {
    return "0.0.0.0";
  }
}

// ─── Input Sanitization ──────────────────────────────────────────────────────

/**
 * Strip null bytes, control characters, and excessive whitespace from a string.
 * Does NOT HTML-encode — let the DB layer handle escaping.
 */
export function sanitizeString(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/\0/g, "")                          // null bytes
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // control chars (keep tab/newline)
    .replace(/\s{3,}/g, "  ")                    // collapse 3+ whitespace to 2
    .trim();
}

/**
 * Recursively sanitize all string values in an object.
 * Safe for nested objects / arrays.
 * @param depth Internal recursion guard (max depth 5)
 */
export function sanitizeBody(
  body: unknown,
  depth = 0
): Record<string, unknown> {
  if (depth > 5 || typeof body !== "object" || body === null) {
    return {};
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    const safeKey = sanitizeString(key).slice(0, 100);
    if (!safeKey) continue;

    if (typeof value === "string") {
      sanitized[safeKey] = sanitizeString(value).slice(0, 10_000);
    } else if (typeof value === "number" || typeof value === "boolean") {
      sanitized[safeKey] = value;
    } else if (Array.isArray(value)) {
      sanitized[safeKey] = value
        .slice(0, 100) // max 100 array items
        .map((v) =>
          typeof v === "string"
            ? sanitizeString(v).slice(0, 1000)
            : typeof v === "number" || typeof v === "boolean"
            ? v
            : null
        )
        .filter((v) => v !== null);
    } else if (typeof value === "object" && value !== null) {
      sanitized[safeKey] = sanitizeBody(value, depth + 1);
    }
  }
  return sanitized;
}

// ─── Bot / Faker Detection ───────────────────────────────────────────────────

/**
 * Detect obvious bots and attack tools from the User-Agent header.
 */
export function isBotUserAgent(req: Request): boolean {
  const ua = req.headers.get("user-agent") ?? "";
  if (!ua || ua.length < 4) return true; // missing or suspiciously short UA
  return BLOCKED_UA_PATTERNS.some((pattern) => pattern.test(ua));
}

/**
 * Check for honeypot fields in the request body.
 * Legitimate users never fill these (they're hidden fields).
 */
export function hasHoneypotField(body: Record<string, unknown>): boolean {
  const keys = Object.keys(body).map((k) => k.toLowerCase());
  return HONEYPOT_FIELDS.some((trap) => keys.includes(trap));
}

/**
 * Check headers for injection attack signatures.
 */
export function hasSuspiciousHeaders(req: Request): boolean {
  const checkHeaders = [
    "user-agent",
    "referer",
    "x-forwarded-host",
    "origin",
    "content-type",
  ];

  for (const header of checkHeaders) {
    const value = (req.headers.get(header) ?? "").toLowerCase();
    if (SUSPICIOUS_HEADER_VALUES.some((pattern) => value.includes(pattern))) {
      return true;
    }
  }
  return false;
}

/**
 * Check if request body size exceeds limit.
 * Reads Content-Length header — doesn't stream the body.
 */
export function isBodyTooLarge(
  req: Request,
  isUpload = false
): boolean {
  const contentLength = req.headers.get("content-length");
  if (!contentLength) return false;
  const size = parseInt(contentLength, 10);
  if (isNaN(size)) return false;
  const limit = isUpload ? MAX_UPLOAD_SIZE_BYTES : MAX_BODY_SIZE_BYTES;
  return size > limit;
}

// ─── Combined Request Validation ─────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  status?: number;
}

/**
 * Full request validation pipeline.
 * Call at the start of any API route handler.
 *
 * Checks (in order):
 * 1. Content-Type header (for POST/PUT/PATCH)
 * 2. Body size limit
 * 3. Bot User-Agent
 * 4. Suspicious headers
 *
 * Does NOT check CSRF here — call validateCsrfToken() separately for
 * state-mutating routes that require it.
 */
export function validateRequest(
  req: Request,
  options: {
    requireJson?: boolean;
    isUpload?: boolean;
    skipUaCheck?: boolean;
  } = {}
): ValidationResult {
  const method = req.method?.toUpperCase();
  const isMutating = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

  // 1. Content-Type check for mutating requests
  if (
    isMutating &&
    options.requireJson !== false &&
    !options.isUpload
  ) {
    const ct = req.headers.get("content-type") ?? "";
    if (!ct.includes("application/json")) {
      return {
        valid: false,
        reason: "Content-Type must be application/json",
        status: 415,
      };
    }
  }

  // 2. Body size limit
  if (isBodyTooLarge(req, options.isUpload)) {
    return {
      valid: false,
      reason: "Request body too large",
      status: 413,
    };
  }

  // 3. Bot detection
  if (!options.skipUaCheck && isBotUserAgent(req)) {
    return {
      valid: false,
      reason: "Forbidden: automated requests not allowed",
      status: 403,
    };
  }

  // 4. Header injection check
  if (hasSuspiciousHeaders(req)) {
    return {
      valid: false,
      reason: "Forbidden: suspicious request headers",
      status: 403,
    };
  }

  return { valid: true };
}

/**
 * Returns a NextResponse for a failed validation result.
 * Use like: if (!result.valid) return securityErrorResponse(result);
 */
export function securityErrorResponse(result: ValidationResult): NextResponse {
  return NextResponse.json(
    { message: result.reason ?? "Forbidden" },
    { status: result.status ?? 403 }
  );
}

// ─── Security Headers Preset ─────────────────────────────────────────────────

/**
 * Add standard security headers to a NextResponse.
 * Call on all API responses.
 */
export function addSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  res.headers.set("Cache-Control", "no-store");
  return res;
}

/**
 * Wrap a JSON response with security headers.
 * Drop-in replacement for NextResponse.json().
 *
 * @example
 * return secureJson({ message: "ok" }, { status: 200 });
 */
export function secureJson(
  body: unknown,
  init?: ResponseInit
): NextResponse {
  const res = NextResponse.json(body, init);
  return addSecurityHeaders(res);
}
