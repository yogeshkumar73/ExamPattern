import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

/**
 * GET /api/admin/arena-approvals - Get all pending arena approval requests
 * POST /api/admin/arena-approvals - Approve or reject arena access for a user
 */

function getSessionUser(req: NextRequest) {
  try {
    const header = req.headers.get('x-session-user');
    if (header) {
      const parsed = JSON.parse(decodeURIComponent(header));
      return parsed?.user || parsed;
    }
  } catch {}
  return null;
}

function checkAdminAuth(user: any) {
  return user && user.role === 'admin';
}

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const sessionUser = getSessionUser(request);
    if (!checkAdminAuth(sessionUser)) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    await dbConnect();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'pending'; // pending, approved, rejected, all

    // Build filter
    const filter =
      status === 'all'
        ? {}
        : {
            arenaApprovalStatus: status,
          };

    // Fetch users with pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const approvals = await User.find(filter)
      .select(
        'name email photoUrl arenaApprovalStatus arenaApprovalReason arenaApprovedAt arenaRejectedAt arenaAccessRequestedAt'
      )
      .sort({ arenaAccessRequestedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: approvals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Arena approvals fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch arena approvals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const sessionUser = getSessionUser(request);
    if (!checkAdminAuth(sessionUser)) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { userId, action, reason } = await request.json();

    // Validation
    if (!userId || !action) {
      return NextResponse.json(
        { error: 'userId and action are required' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    if (action === 'reject' && !reason) {
      return NextResponse.json(
        { error: 'reason is required for rejection' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update approval status
    if (action === 'approve') {
      user.arenaApprovalStatus = "approved";
user.isLabApproved = true;
if (!user.arenaAccess) {
    user.arenaAccess = {
        status: "pending",
        approved: false,
        approvedAt: null,
        rejectedAt: null,
    };
}

user.arenaAccess.status = "approved";
user.arenaAccess.approved = true;
user.arenaAccess.approvedAt = new Date();
user.arenaAccess.rejectedAt = null;

user.arenaApprovedAt = new Date();
user.arenaApprovedBy = sessionUser?.name || "Admin";
user.arenaApprovalReason = "";

user.markModified("arenaAccess");
    } else if (action === 'reject') {
      user.arenaApprovalStatus = "rejected";
user.isLabApproved = false;

user.arenaAccess.status = "rejected";
user.arenaAccess.approved = false;
user.arenaAccess.approvedAt = null;
user.arenaAccess.rejectedAt = new Date();

user.arenaRejectedAt = new Date();
user.arenaApprovalReason =
  reason || "Rejected by admin";

user.markModified("arenaAccess");

    }
    await user.save();

    return NextResponse.json({
      success: true,
      message: `Arena access ${action}ed for ${user.name}`,
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        arenaApprovalStatus: user.arenaApprovalStatus,
        arenaApprovedAt: user.arenaApprovedAt,
        arenaRejectedAt: user.arenaRejectedAt,  
        arenaApprovalReason: user.arenaApprovalReason,
      },
    });
  } catch (error: any) {
    console.error('Arena approval error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update arena approval' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/arena-approvals - Bulk approve/reject
 */
export async function PUT(request: NextRequest) {
  try {
    const sessionUser = getSessionUser(request);

    if (!checkAdminAuth(sessionUser)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { userIds, action, reason } = await request.json();

    await dbConnect();

    const updateData: any = {};

    if (action === "approve") {
      updateData.arenaApprovalStatus = "approved";
      updateData.isLabApproved = true;
      updateData.arenaApprovedAt = new Date();
      updateData.arenaApprovalReason = "";
      updateData.arenaRejectedAt = null;

      updateData.arenaAccess = {
        status: "approved",
        approved: true,
        approvedAt: new Date(),
        rejectedAt: null,
      };
    }

    if (action === "reject") {
      updateData.arenaApprovalStatus = "rejected";
      updateData.isLabApproved = false;
      updateData.arenaRejectedAt = new Date();
      updateData.arenaApprovalReason = reason || "";

      updateData.arenaAccess = {
        status: "rejected",
        approved: false,
        approvedAt: null,
        rejectedAt: new Date(),
      };
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      {
        $set: updateData,
      }
    );

    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount,
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/arena-approvals - Reset approval status for a user
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check admin authentication
    const sessionUser = getSessionUser(request);
    if (!checkAdminAuth(sessionUser)) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
         arenaApprovalStatus: "pending",
arenaApprovedAt: null,
arenaRejectedAt: null,
arenaApprovalReason: "",

isLabApproved: false,

arenaAccess: {
    status: "pending",
    approved: false,
    approvedAt: null,
    rejectedAt: null,
},
        },
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Arena approval status reset to pending',
      data: {
        userId: user._id,
        name: user.name,
        arenaApprovalStatus: user.arenaApprovalStatus,
      },
    });
  } catch (error: any) {
    console.error('Arena approval reset error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reset arena approval' },
      { status: 500 }
    );
  }
}
