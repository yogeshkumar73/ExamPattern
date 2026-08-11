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

    await dbConnect();

    const user = await findUserById(userId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Keep arenaAccess synchronized
   const arenaAccess = {
    status: user.arenaAccess?.status ?? user.arenaApprovalStatus,
    approved: user.arenaAccess?.approved ?? false,
    approvedAt: user.arenaAccess?.approvedAt ?? user.arenaApprovedAt,
    rejectedAt: user.arenaAccess?.rejectedAt ?? user.arenaRejectedAt,
    requestedAt:
        user.arenaAccess?.requestedAt ??
        user.arenaAccessRequestedAt,
    approvedBy: user.arenaAccess?.approvedBy,
    rejectionReason:
        user.arenaAccess?.rejectionReason ??
        user.arenaApprovalReason,
};

   return NextResponse.json({
  success: true,
  data: {
    // ==========================
    // Basic Information
    // ==========================
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
    role: user.role,
    status: user.status,

    // ==========================
    // Profile
    // ==========================
    profileComplete: user.profileComplete ?? false,
    isLabApproved: user.isLabApproved ?? false,

    // ==========================
    // Arena Statistics
    // ==========================
    xp: user.xp ?? 0,
    level: user.level ?? 1,
    points: user.points ?? 0,
    coins: user.coins ?? 0,

    arenaPoints: user.arenaPoints ?? 0,
    arenaRank: user.arenaRank ?? null,

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
    gameStats: user.gameStats,
    battleHistory: user.battleHistory,

    // ==========================
    // Arena Approval
    // ==========================
    arenaApprovalStatus: user.arenaApprovalStatus,
    arenaApprovalReason: user.arenaApprovalReason,
    arenaApprovedAt: user.arenaApprovedAt,
    arenaRejectedAt: user.arenaRejectedAt,
    arenaAccessRequestedAt: user.arenaAccessRequestedAt,

    arenaAccess,

    isApproved: arenaAccess.approved,
    isPending: arenaAccess.status === "pending",
    isRejected: arenaAccess.status === "rejected",
  },
});
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message || "Failed to fetch arena status",
      },
      {
        status: 500,
      }
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

    // Only allow 'request' action from students
    if (action !== 'request') {
      return NextResponse.json(
        { error: 'Invalid action. Use "request" to request arena access' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await findUserById(userId);
    if (!user) {
      // Check if it's a mock user
      const { mockUsers } = await import('@/lib/mockDb');
      const mockUser = mockUsers.find((u: any) => u._id === userId);
      if (mockUser) {
        // Update mock user
        mockUser.arenaApprovalStatus = 'pending';
        mockUser.arenaAccessRequestedAt = new Date().toISOString();
        mockUser.arenaApprovalReason = '';
        mockUser.arenaRejectedAt = null;
        mockUser.arenaAccess = { status: 'pending', approved: false, approvedAt: null, rejectedAt: null };
        return NextResponse.json({
          success: true,
          message: 'Arena access request submitted (mock). Please wait for admin approval.',
          data: {
            userId: mockUser._id,
            name: mockUser.name,
            arenaApprovalStatus: mockUser.arenaApprovalStatus,
          },
        });
      }
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If already approved, cannot request again
   if (user.arenaApprovalStatus === "approved") {
  return NextResponse.json({
    success: true,
    message: "Arena access already approved.",
    data: {
      arenaApprovalStatus: user.arenaApprovalStatus,
      arenaAccess: user.arenaAccess,
    },
  });
}

    // If already pending, don't create duplicate request
   if (user.arenaApprovalStatus === "pending") {
  return NextResponse.json({
    success: true,
    message: "Arena request already pending.",
    data: {
      arenaApprovalStatus: user.arenaApprovalStatus,
    },
  });
} 
    // If rejected, allow to request again
  user.arenaApprovalStatus = "pending";
user.arenaApprovalReason = "";
user.arenaApprovedAt = null;
user.arenaRejectedAt = null;
user.arenaAccessRequestedAt = new Date();

user.arenaAccess = {
    status: "pending",
    approved: false,
    approvedAt: null,
    rejectedAt: null,
    requestedAt: new Date(),
    approvedBy: null,
    rejectionReason: "",
};

    user.markModified("arenaAccess");
await user.save();
const updatedUser = await User.findById(user._id);
    return NextResponse.json({
  success: true,
  message: "Arena request submitted successfully.",
  data: {
    userId: user._id,
    arenaApprovalStatus: user.arenaApprovalStatus,
    arenaAccess: updatedUser.arenaAccess,
  },
});

  } catch (error: any) {
    console.error('Arena request error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit arena access request' },
      { status: 500 }
    );
  }
}
