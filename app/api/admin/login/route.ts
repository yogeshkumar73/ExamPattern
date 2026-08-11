import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

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
    // --------------------------------
    // 1. Parse request body
    // --------------------------------
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request.",
        },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // --------------------------------
    // 2. Validate password
    // --------------------------------
    if (
      typeof body !== "object" ||
      body === null ||
      !("password" in body)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Password is required.",
        },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const passwordValue = (body as { password?: unknown }).password;

    if (typeof passwordValue !== "string" || passwordValue.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Password is required.",
        },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const password = passwordValue;

    // --------------------------------
    // 3. Read server-side secrets
    // --------------------------------
    const adminPassword = process.env.ADMIN_PASSWORD;
    const sessionSecret = process.env.ADMIN_SESSION_SECRET;

    if (!adminPassword || !sessionSecret) {
      console.error(
        "Admin authentication is not configured correctly."
      );

      return NextResponse.json(
        {
          success: false,
          message: "Server configuration error.",
        },
        {
          status: 500,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // --------------------------------
    // 4. Verify admin password
    // --------------------------------
    const valid = safeCompare(password, adminPassword);

    if (!valid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials.",
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // --------------------------------
    // 5. Create signed session
    // --------------------------------
    const expires = Date.now() + SESSION_DURATION * 1000;

    const payload = String(expires);
    const signature = sign(payload, sessionSecret);

    const token = `${payload}.${signature}`;

    // --------------------------------
    // 6. Set secure HTTP-only cookie
    // --------------------------------
    const response = NextResponse.json(
      {
        success: true,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
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
      {
        success: false,
        message: "Internal server error.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}