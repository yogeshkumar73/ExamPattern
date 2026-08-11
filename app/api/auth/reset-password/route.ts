import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { mockUsers } from "@/lib/mockDb";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";

const EMAIL_REGEX =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const PHONE_REGEX = /^[6-9]\d{9}$/;

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&^()_\-+=])[A-Za-z\d@$!%*?#&^()_\-+=]{8,}$/;

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`reset-pw:${ip}`, 5, 60 * 60 * 1000);

    if (!rl.allowed) {
      return NextResponse.json(
        { message: `Too many password reset attempts. Try again in ${rl.resetIn}s.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    let { email, phone, newPassword } = body;

    email = email?.trim().toLowerCase();
    phone = phone?.trim().replace(/\s+/g, ""); // strip spaces from phone

    // ── All three fields are required ─────────────────────────────
    if (!email || !phone || !newPassword) {
      return NextResponse.json(
        { message: "Gmail address, phone number, and new password are all required to verify your identity." },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { message: "Invalid Gmail address format." },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/^\+91/, ""); // strip country code if present
    if (!PHONE_REGEX.test(cleanPhone)) {
      return NextResponse.json(
        { message: "Invalid phone number. Please enter the 10-digit number registered with your account." },
        { status: 400 }
      );
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      return NextResponse.json(
        {
          message:
            "Password must be at least 8 characters and contain uppercase, lowercase, a number, and a special character (@$!%*?#&^()_-+=).",
        },
        { status: 400 }
      );
    }

    try {
      await dbConnect();
      const user = await User.findOne({ email }).select("+password +phone");

      if (!user) {
        // Generic message to prevent email enumeration
        return NextResponse.json(
          { message: "No account found with that Gmail and phone number combination. Please check your details." },
          { status: 404 }
        );
      }

      // ── Strict phone verification — REQUIRED ─────────────────────
      const storedPhone = (user.phone || "").trim().replace(/\s+/g, "").replace(/^\+91/, "");
      if (storedPhone !== cleanPhone) {
        return NextResponse.json(
          { message: "The phone number does not match the one registered with this account. Please check your details." },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      user.password = hashedPassword;
      await user.save();

      return NextResponse.json({
        success: true,
        message: "Password updated successfully! You can now login with your new password.",
      });
    } catch (dbError) {
      console.warn("MongoDB unavailable for password reset. Checking Mock DB.", dbError);

      const mockUser = mockUsers.find(
        (u) => u.email.toLowerCase() === email
      );

      if (!mockUser) {
        return NextResponse.json(
          { message: "No account found with that Gmail and phone number combination. Please check your details." },
          { status: 404 }
        );
      }

      // ── Strict phone verification for mock DB ────────────────────
      const storedMockPhone = (mockUser.phone || "").trim().replace(/\s+/g, "").replace(/^\+91/, "");
      if (storedMockPhone !== cleanPhone) {
        return NextResponse.json(
          { message: "The phone number does not match the one registered with this account. Please check your details." },
          { status: 400 }
        );
      }

      mockUser.password = await bcrypt.hash(newPassword, 12);

      return NextResponse.json({
        success: true,
        message: "Password updated successfully! You can now login with your new password.",
      });
    }
  } catch (error: any) {
    console.error("Password Reset Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
