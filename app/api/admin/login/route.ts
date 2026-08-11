import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE_NAME = "admin-session";
const SESSION_DURATION = 60 * 30; // 30 minutes

function sign(value: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(value)
    .digest("hex");
}

function safeCompare(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a, "utf8");
  const bBuffer = Buffer.from(b, "utf8");

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
}

export async function POST(req: NextRequest) {
  try {
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid request body." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (typeof body !== "object" || body === null || !("password" in body)) {
      return NextResponse.json(
        { success: false, message: "Password is required." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const passwordValue = (body as { password?: unknown }).password;

    if (typeof passwordValue !== "string" || passwordValue.length === 0) {
      return NextResponse.json(
        { success: false, message: "Password is required." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const password = passwordValue;
    const adminEnvPassword = process.env.ADMIN_PASSWORD || "admin123";
    const sessionSecret = process.env.ADMIN_SESSION_SECRET || "aura-admin-session-secret-2026-key";

    let isValidPassword = false;

    // ── 1. Check MongoDB for admin user first ─────────────────────
    try {
      await dbConnect();
      const adminUsers = await User.find({ role: "admin" }).select("+password");

      if (adminUsers && adminUsers.length > 0) {
        for (const adminUser of adminUsers) {
          if (adminUser.password) {
            const match = await bcrypt.compare(password, adminUser.password);
            if (match) {
              isValidPassword = true;
              break;
            }
          }
        }
      }
    } catch (dbErr) {
      console.warn("[Admin Login] MongoDB unavailable, falling back to ENV password:", dbErr);
    }

    // ── 2. Fallback to ENV password check ──────────────────────────
    if (!isValidPassword) {
      const adminHash = process.env.ADMIN_PASSWORD_HASH;

      // Check if ADMIN_PASSWORD_HASH is set
      if (adminHash && (await bcrypt.compare(password, adminHash))) {
        isValidPassword = true;
      }
      // Check if ADMIN_PASSWORD itself is a bcrypt hash
      else if (adminEnvPassword.startsWith("$2a$") || adminEnvPassword.startsWith("$2b$") || adminEnvPassword.startsWith("$2y$")) {
        if (await bcrypt.compare(password, adminEnvPassword)) {
          isValidPassword = true;
        }
      }
      // Direct plaintext comparison against ADMIN_PASSWORD env var
      else if (safeCompare(password, adminEnvPassword)) {
        isValidPassword = true;
      }
    }

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: "Invalid admin password." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    // ── 3. Create signed session token ────────────────────────────
    const expires = Date.now() + SESSION_DURATION * 1000;
    const payload = String(expires);
    const signature = sign(payload, sessionSecret);
    const token = `${payload}.${signature}`;

    // ── 4. Set secure HTTP-only cookie ────────────────────────────
    const response = NextResponse.json(
      { success: true, message: "Admin access granted." },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_DURATION,
      priority: "high",
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}