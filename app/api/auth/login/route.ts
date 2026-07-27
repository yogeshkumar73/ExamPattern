import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { mockUsers } from "@/lib/mockDb";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // Parse body
    let body;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (
      !email ||
      !password ||
      email.length > 254 ||
      password.length > 128
    ) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 400 }
      );
    }

    // Rate limit
    const ip = getClientIp(req);

    const rl = checkRateLimit(
      `login:${ip}:${email}`,
      10,
      15 * 60 * 1000
    );

    if (!rl.allowed) {
      return NextResponse.json(
        {
          message: "Too many login attempts. Try again later.",
        },
        { status: 429 }
      );
    }

    try {
      await dbConnect();

      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return NextResponse.json(
          { message: "Invalid credentials." },
          { status: 401 }
        );
      }

      if (user.status === "Inactive") {
        return NextResponse.json(
          {
            message:
              "Your account has been deactivated. Contact admin.",
          },
          { status: 403 }
        );
      }

      const isMatch = await bcrypt.compare(
        password,
        user.password ?? ""
      );

      if (!isMatch) {
        return NextResponse.json(
          { message: "Invalid credentials." },
          { status: 401 }
        );
      }

      return NextResponse.json({
        message: "Login successful",
       user: {
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone ?? "",
  photoUrl: user.photoUrl ?? "",
  branch: user.branch ?? "",
  bio: user.bio ?? "",
  stream: user.stream ?? "",
  course: user.course ?? "",
  department: user.department ?? "",
  grade: user.grade ?? "",
  role: user.role ?? "student",

  profileComplete: user.profileComplete ?? false,
  status: user.status ?? "Active",

  // Arena access flags
  isLabApproved: user.isLabApproved ?? false,

  arenaApprovalStatus:
    user.arenaApprovalStatus ?? "pending",

  arenaApprovalReason:
    user.arenaApprovalReason ?? "",

  arenaAccessRequestedAt:
    user.arenaAccessRequestedAt ?? null,

  arenaApprovedAt:
    user.arenaApprovedAt ?? null,

  arenaRejectedAt:
    user.arenaRejectedAt ?? null,

  // Return the complete arenaAccess object
  arenaAccess: {
    status:
      user.arenaAccess?.status ??
      user.arenaApprovalStatus ??
      "pending",

    approved:
      user.arenaAccess?.approved ??
      user.isLabApproved ??
      false,

    approvedAt:
      user.arenaAccess?.approvedAt ??
      user.arenaApprovedAt ??
      null,

    rejectedAt:
      user.arenaAccess?.rejectedAt ??
      user.arenaRejectedAt ??
      null,
  },

  points: user.points ?? 0,
  rank: user.rank ?? "Bronze",
}
      });
    } catch (dbErr) {
      console.error("Database Error:", dbErr);

      if (process.env.NODE_ENV !== "development") {
        return NextResponse.json(
          {
            message:
              "Service temporarily unavailable.",
          },
          { status: 503 }
        );
      }

      console.warn("Using Mock Database (Development Only)");

      let user = mockUsers.find(
        (u) => u.email === email
      );

      if (!user) {
        const mockId = `USR-${Math.random()
          .toString(36)
          .substring(2, 11)
          .toUpperCase()}`;

        const newMock = {
          _id: mockId,
          name: email.split("@")[0].toUpperCase(),
          email,
          phone: "",
          photoUrl: "",
          branch: "",
          bio: "",
          stream: "",
          course: "",
          department: "",
          grade: "",
          role: "student" as const,
          profileComplete: false,
          isLabApproved: true,
          status: "Active" as const,
          points: 0,
          rank: "Bronze" as const,

          arenaApprovalStatus: "pending" as const,
          arenaApprovalReason: "",
          arenaAccessRequestedAt:
            new Date().toISOString(),
          arenaApprovedAt: null,
          arenaRejectedAt: null,
        };

        mockUsers.push(newMock);
        user = newMock;
      }

      if (user.status === "Inactive") {
        return NextResponse.json(
          {
            message:
              "Your account has been deactivated. Contact admin.",
          },
          { status: 403 }
        );
      }

      const safeUser = {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone ?? "",
        photoUrl: user.photoUrl ?? "",
        branch: user.branch ?? "",
        bio: user.bio ?? "",
        stream: user.stream ?? "",
        course: user.course ?? "",
        department: user.department ?? "",
        grade: user.grade ?? "",
        role: user.role ?? "student",
        profileComplete:
          user.profileComplete ?? false,
        isLabApproved:
          user.isLabApproved ?? false,
        status: user.status ?? "Active",
        points: user.points ?? 0,
        rank: user.rank ?? "Bronze",

        arenaApprovalStatus:
          user.arenaApprovalStatus ?? "pending",

        arenaApprovalReason:
          user.arenaApprovalReason ?? "",

        arenaAccessRequestedAt:
          user.arenaAccessRequestedAt ??
          new Date().toISOString(),

        arenaApprovedAt:
          user.arenaApprovedAt ?? null,

        arenaRejectedAt:
          user.arenaRejectedAt ?? null,
      };

      const response = NextResponse.json({
        message: "Login successful (offline mode)",
        user: safeUser,
      });

      response.headers.set(
        "Cache-Control",
        "no-store"
      );

      response.headers.set(
        "X-Content-Type-Options",
        "nosniff"
      );

      return response;
    }
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}