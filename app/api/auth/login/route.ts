import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { mockUsers } from "@/lib/mockDb";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";

export async function POST(req: Request) {
  try {
    // Rate limit: 10 attempts per IP per 15 minutes
    const ip = getClientIp(req);
    const rl = checkRateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { message: `Too many login attempts. Try again in ${rl.resetIn}s.` },
        { status: 429 }
      );
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Please provide email and password." }, { status: 400 });
    }

    try {
      await dbConnect();

      const user = await User.findOne({ email });
      if (!user) {
        return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
      }

      // Block inactive accounts
      if (user.status === "Inactive") {
        return NextResponse.json(
          { message: "Your account has been deactivated. Contact admin." },
          { status: 403 }
        );
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
      }

      return NextResponse.json({
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          photoUrl: user.photoUrl || "",
          branch: user.branch || "",
          bio: user.bio || "",
          stream: user.stream || "",
          course: user.course || "",
          department: user.department || "",
          grade: user.grade || "",
          role: user.role || "student",
          profileComplete: user.profileComplete || false,
          isLabApproved: user.isLabApproved || false,
          status: user.status || "Active",
          points: user.points || 0,
          rank: user.rank || "Bronze",
          // Arena Approval Status
          arenaApprovalStatus: user.arenaApprovalStatus || "pending",
          arenaApprovalReason: user.arenaApprovalReason || "",
          arenaAccessRequestedAt: user.arenaAccessRequestedAt || new Date().toISOString(),
          arenaApprovedAt: user.arenaApprovedAt || null,
          arenaRejectedAt: user.arenaRejectedAt || null,
        },
      });
    } catch (dbErr) {
      console.warn("MongoDB unavailable, using mock DB:", dbErr);

      // Fallback: mock DB
      let user = mockUsers.find((u) => u.email === email);

      if (!user) {
        // Create dynamic mock user for demo
        const mockId = `USR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const newMock = {
          _id: mockId,
          name: email.split("@")[0].toUpperCase(),
          email,
          phone: "",
          status: "Active" as const,
          isLabApproved: true,
          points: 0,
          rank: "Bronze" as const,
          role: "student" as const,
          profileComplete: false,
          // Arena Approval Status
          arenaApprovalStatus: "pending" as const,
          arenaAccessRequestedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        mockUsers.push(newMock);
        user = newMock;
      }

      if (user.status === "Inactive") {
        return NextResponse.json(
          { message: "Your account has been deactivated. Contact admin." },
          { status: 403 }
        );
      }

      return NextResponse.json({
        message: "Login successful (offline mode)",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          photoUrl: user.photoUrl || "",
          branch: user.branch || "",
          bio: user.bio || "",
          stream: user.stream || "",
          course: user.course || "",
          department: user.department || "",
          grade: user.grade || "",
          role: user.role || "student",
          profileComplete: user.profileComplete ?? false,
          isLabApproved: user.isLabApproved,
          status: user.status,
          points: user.points || 0,
          rank: user.rank || "Bronze",
          // Arena Approval Status
          arenaApprovalStatus: user.arenaApprovalStatus || "pending",
          arenaApprovalReason: user.arenaApprovalReason || "",
          arenaAccessRequestedAt: user.arenaAccessRequestedAt || new Date().toISOString(),
          arenaApprovedAt: user.arenaApprovedAt || null,
          arenaRejectedAt: user.arenaRejectedAt || null,
        },
      });
    }
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
