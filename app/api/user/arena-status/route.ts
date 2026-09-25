import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

/**
 * GET /api/user/arena-status - Get current user's arena approval status
 * POST /api/user/arena-status - Request arena access
 */

// Helper to find user by ID (supports both ObjectId and custom string IDs)
async function findUserById(userId: string) {
  if (mongoose.isValidObjectId(userId)) {
    return User.findById(userId);
  }

  return User.findOne({
    $or: [
      { customId: userId },
      { email: userId },
      { username: userId },
    ],
  });
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    let user: any = null;
    try {
      await dbConnect();
      user = await findUserById(userId);
    } catch (dbErr) {
      console.warn("MongoDB connection failed in arena-status, falling back to mockDb:", dbErr);
    }

    // Fallback: search in mock users if DB lookup failed
    if (!user) {
      const { mockUsers } = await import('@/lib/mockDb');
      user = mockUsers.find((u: any) => u._id === userId || u.email?.toLowerCase() === userId.toLowerCase());
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Determine suspension and approval state
    const isSuspended = user.status === "Suspended" || user.arenaApprovalStatus === "suspended";
    const approvalStatus = isSuspended
      ? "suspended"
      : (user.arenaApprovalStatus || "approved");

    const isApproved = !isSuspended && (approvalStatus === "approved" || user.role === "admin");

    // Keep arenaAccess synchronized
    const arenaAccess = {
      status: approvalStatus,
      approved: isApproved,
      approvedAt: user.arenaAccess?.approvedAt ?? user.arenaApprovedAt ?? new Date(),
      rejectedAt: user.arenaAccess?.rejectedAt ?? user.arenaRejectedAt ?? null,
      requestedAt: user.arenaAccess?.requestedAt ?? user.arenaAccessRequestedAt ?? new Date(),
      approvedBy: user.arenaAccess?.approvedBy ?? "System",
      rejectionReason: isSuspended
        ? "Account suspended by administrator"
        : (user.arenaAccess?.rejectionReason ?? user.arenaApprovalReason ?? ""),
    };

    return NextResponse.json({
      success: true,
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone ?? "",
        photoUrl: user.photoUrl ?? "",
        bio: user.bio ?? "",
        branch: user.branch ?? "",
        stream: user.stream ?? "",
        course: user.course ?? "",
        department: user.department ?? "",
        grade: user.grade ?? "",
        role: user.role ?? "student",
        status: user.status ?? "Active",

        profileComplete: user.profileComplete ?? false,
        isLabApproved: isSuspended ? false : (user.isLabApproved ?? true),

        xp: user.xp ?? 0,
        level: user.level ?? 1,
        points: user.points ?? 0,
        coins: user.coins ?? 0,

        arenaPoints: user.arenaPoints ?? 1200,
        arenaRank: user.arenaRank ?? "Bronze",

        wins: user.wins ?? 0,
        losses: user.losses ?? 0,
        draws: user.draws ?? 0,
        totalBattles: user.totalBattles ?? 0,

        winRate: user.winRate ?? 0,
        accuracy: user.accuracy ?? 0,

        currentStreak: user.currentStreak ?? 0,
        bestStreak: user.bestStreak ?? 0,

        totalCorrect: user.totalCorrect ?? 0,
        totalAttempted: user.totalAttempted ?? 0,

        badges: user.badges ?? [],
        gameStats: user.gameStats ?? {},
        battleHistory: user.battleHistory ?? [],

        arenaApprovalStatus: approvalStatus,
        arenaApprovalReason: arenaAccess.rejectionReason,
        arenaApprovedAt: user.arenaApprovedAt ?? arenaAccess.approvedAt,
        arenaRejectedAt: user.arenaRejectedAt ?? arenaAccess.rejectedAt,
        arenaAccessRequestedAt: user.arenaAccessRequestedAt ?? arenaAccess.requestedAt,

        arenaAccess,

        isApproved,
        isSuspended,
        isPending: approvalStatus === "pending",
        isRejected: approvalStatus === "rejected",
      },
    });
  } catch (error: any) {
    console.error("Fetch arena status error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch arena status" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, action } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (action !== 'request') {
      return NextResponse.json(
        { error: 'Invalid action. Use "request" to request arena access' },
        { status: 400 }
      );
    }

    let user: any = null;
    try {
      await dbConnect();
      user = await findUserById(userId);
    } catch (dbErr) {
      console.warn("MongoDB connection failed in arena-status request:", dbErr);
    }

    if (!user) {
      // Check if it's a mock user
      const { mockUsers } = await import('@/lib/mockDb');
      const mockUser = mockUsers.find((u: any) => u._id === userId);
      if (mockUser) {
        if (mockUser.status === 'Suspended') {
          return NextResponse.json(
            { error: 'Your account has been suspended by an administrator. Please contact support.' },
            { status: 403 }
          );
        }

        mockUser.arenaApprovalStatus = 'approved';
        mockUser.arenaAccessRequestedAt = new Date().toISOString();
        mockUser.arenaApprovalReason = 'Auto-approved';
        mockUser.arenaApprovedAt = new Date().toISOString();
        mockUser.arenaRejectedAt = null;
        mockUser.arenaAccess = {
          status: 'approved',
          approved: true,
          approvedAt: new Date().toISOString(),
          rejectedAt: null,
        };

        return NextResponse.json({
          success: true,
          message: 'Arena access is approved.',
          data: {
            userId: mockUser._id,
            name: mockUser.name,
            arenaApprovalStatus: mockUser.arenaApprovalStatus,
          },
        });
      }
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check account suspension
    if (user.status === 'Suspended') {
      return NextResponse.json(
        { error: 'Your account has been suspended by an administrator. Please contact support.' },
        { status: 403 }
      );
    }

    // If already approved, return success
    if (user.arenaApprovalStatus === "approved" && user.arenaAccess?.approved) {
      return NextResponse.json({
        success: true,
        message: "Arena access already approved.",
        data: {
          arenaApprovalStatus: user.arenaApprovalStatus,
          arenaAccess: user.arenaAccess,
        },
      });
    }

    // Auto-approve user upon request
    const now = new Date();
    user.arenaApprovalStatus = "approved";
    user.isLabApproved = true;
    user.arenaApprovalReason = "Auto-approved";
    user.arenaApprovedAt = now;
    user.arenaRejectedAt = null;
    user.arenaAccessRequestedAt = now;

    user.arenaAccess = {
      status: "approved",
      approved: true,
      approvedAt: now,
      rejectedAt: null,
      requestedAt: now,
      approvedBy: "System (Auto-Approved)",
      rejectionReason: "",
    };

    user.markModified("arenaAccess");
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Arena access is approved.",
      data: {
        userId: user._id,
        arenaApprovalStatus: user.arenaApprovalStatus,
        arenaAccess: user.arenaAccess,
      },
    });

  } catch (error: any) {
    console.error('Arena request error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process arena access request' },
      { status: 500 }
    );
  }
}
