import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { mockUsers } from "@/lib/mockDb";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";

export async function POST(req: Request) {
  try {
    // Rate limit: 5 registrations per IP per hour
    const ip = getClientIp(req);
    const rl = checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { message: `Too many registration attempts. Try again in ${rl.resetIn}s.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, password, phone } = body;

    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { message: "Please provide name, email, password, and phone." },
        { status: 400 }
      );
    }

    // Captcha removed: no captchaRequired check

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: "Invalid email address." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    try {
      await dbConnect();

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json({ message: "User already exists" }, { status: 409 });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone: phone || "",
        isLabApproved: true,
        status: "Active",
        role: "student",
        profileComplete: false, // Mandatory stream setup required
        // Arena Access Fields
        arenaApprovalStatus: 'pending',
        arenaAccessRequestedAt: new Date(),
        arenaApprovalReason: '',
        arenaApprovedBy: '',
        arenaApprovedAt: null,
        arenaRejectedAt: null,
      });

      return NextResponse.json(
        { message: "Registration successful! Please set up your academic profile.", userId: user._id },
        { status: 201 }
      );
    } catch (dbErr) {
      console.warn("MongoDB unavailable, using mock DB:", dbErr);

      const existingMock = mockUsers.find((u) => u.email === email);
      if (existingMock) {
        return NextResponse.json({ message: "User already exists" }, { status: 409 });
      }

      const mockId = `USR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      mockUsers.push({
        _id: mockId,
        name,
        email,
        phone: phone || "",
        status: "Active",
        isLabApproved: true,
        points: 0,
        rank: "Bronze",
        role: "student",
        profileComplete: false,
        // Arena Access Fields
        arenaApprovalStatus: 'pending',
        arenaAccessRequestedAt: new Date().toISOString(),
        arenaApprovalReason: '',
        arenaApprovedBy: '',
        arenaApprovedAt: null,
        arenaRejectedAt: null,
        createdAt: new Date().toISOString(),
      });

      return NextResponse.json(
        { message: "Registration successful! Please set up your academic profile.", userId: mockId },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error("Registration Error:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
