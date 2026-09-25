import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { mockUsers } from "@/lib/mockDb";

function checkAdminAuth(req: Request): boolean {
  try {
    const sessionHeader = req.headers.get("x-session-user");
    if (sessionHeader) {
      const parsed = JSON.parse(decodeURIComponent(sessionHeader));
      const user = parsed?.user || parsed;
      if (user?.role === "admin" || user?.isAdmin) return true;
    }
  } catch {}

  const cookieHeader = req.headers.get("cookie") || "";
  if (cookieHeader.includes("admin-session=")) {
    return true;
  }

  return false;
}

export async function GET(req: Request) {
  try {
    try {
      await dbConnect();
      const users = await User.find({})
        .select("-password")
        .sort({ points: -1, createdAt: -1 })
        .lean();
      return NextResponse.json({ users }, { status: 200 });
    } catch (dbErr) {
      console.warn("MongoDB connection failed for user list, falling back to hybrid mock DB:", dbErr);
    }

    // Fallback: Hybrid Mock Database (sanitized)
    const sanitizedMock = mockUsers.map(u => {
      const { ...safe } = u as any;
      delete safe.password;
      return safe;
    });

    return NextResponse.json({ users: sanitizedMock }, { status: 200 });
  } catch (error: any) {
    console.error("Fetch Users Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    // Admin security authorization check
    if (!checkAdminAuth(req)) {
      return NextResponse.json(
        { error: "Unauthorized - Admin superuser access required" },
        { status: 401 }
      );
    }

    const { userId, isLabApproved, status, arenaApprovalStatus, role } = await req.json();

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    // Validate status if provided
    if (status !== undefined && !["Active", "Inactive", "Suspended"].includes(status)) {
      return NextResponse.json(
        { message: "Invalid status value. Must be Active, Inactive, or Suspended." },
        { status: 400 }
      );
    }

    try {
      await dbConnect();
      const updateData: any = {};
      if (isLabApproved !== undefined) updateData.isLabApproved = isLabApproved;
      if (status !== undefined) updateData.status = status;
      if (role !== undefined) updateData.role = role;

      if (arenaApprovalStatus !== undefined) {
        updateData.arenaApprovalStatus = arenaApprovalStatus;
        if (arenaApprovalStatus === "approved") {
          updateData.arenaApprovedAt = new Date();
          updateData.arenaApprovalReason = "Approved by admin";
          updateData.arenaAccess = {
            status: "approved",
            approved: true,
            approvedAt: new Date(),
            rejectedAt: null,
            requestedAt: new Date(),
            approvedBy: "Admin",
            rejectionReason: "",
          };
        } else if (arenaApprovalStatus === "rejected" || arenaApprovalStatus === "suspended") {
          updateData.arenaRejectedAt = new Date();
          updateData.arenaApprovalReason = status === "Suspended" ? "Account suspended by admin" : "Revoked by admin";
          updateData.arenaAccess = {
            status: arenaApprovalStatus,
            approved: false,
            approvedAt: null,
            rejectedAt: new Date(),
            requestedAt: new Date(),
            approvedBy: "Admin",
            rejectionReason: updateData.arenaApprovalReason,
          };
        }
      }

      // If account is suspended, also auto-suspend arena access
      if (status === "Suspended") {
        updateData.arenaApprovalStatus = "suspended";
        updateData.isLabApproved = false;
        updateData.arenaAccess = {
          status: "suspended",
          approved: false,
          approvedAt: null,
          rejectedAt: new Date(),
          requestedAt: new Date(),
          approvedBy: "Admin",
          rejectionReason: "Account suspended by admin",
        };
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select("-password");

      if (user) {
        return NextResponse.json({ message: "User updated successfully (MDB)", user }, { status: 200 });
      }
    } catch (dbErr) {
      console.warn("MongoDB connection failed for update, falling back to hybrid mock DB:", dbErr);
    }

    // Fallback: Hybrid Mock Database
    const user = mockUsers.find(u => u._id === userId);
    if (!user) {
      return NextResponse.json({ message: "User not found in Mock DB" }, { status: 404 });
    }

    if (isLabApproved !== undefined) user.isLabApproved = isLabApproved;
    if (status !== undefined) user.status = status;
    if (role !== undefined) user.role = role;
    if (arenaApprovalStatus !== undefined) {
      user.arenaApprovalStatus = arenaApprovalStatus;
      user.arenaAccess = {
        status: arenaApprovalStatus,
        approved: arenaApprovalStatus === "approved",
        approvedAt: arenaApprovalStatus === "approved" ? new Date().toISOString() : null,
        rejectedAt: arenaApprovalStatus !== "approved" ? new Date().toISOString() : null,
      };
    }
    if (status === "Suspended") {
      user.arenaApprovalStatus = "suspended";
      user.isLabApproved = false;
      user.arenaAccess = {
        status: "suspended",
        approved: false,
        approvedAt: null,
        rejectedAt: new Date().toISOString(),
      };
    }

    return NextResponse.json({ message: "User updated successfully (Hybrid Mock)", user }, { status: 200 });
  } catch (error: any) {
    console.error("Update User Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
