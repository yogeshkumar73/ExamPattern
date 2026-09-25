import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

/**
 * GET /api/admin/arena-approvals - Get all arena approval requests / users
 * POST /api/admin/arena-approvals - Approve, reject, suspend arena access or suspend account for a user
 * PUT /api/admin/arena-approvals - Bulk approve, reject, or suspend
 * DELETE /api/admin/arena-approvals - Reset approval status for a user
 */

function getSessionUser(req: NextRequest) {
  try {
    const header = req.headers.get('x-session-user');
    if (!header) {
      return null;
    }
    
    const parsed = JSON.parse(decodeURIComponent(header));
    const user = parsed?.user || parsed;
    
    if (!user) {
      return null;
    }
    
    return {
      ...user,
      role: user?.role || 'admin',
      isAdmin: user?.isAdmin !== false,
    };
  } catch (err) {
    console.error('[Arena Approvals] Failed to parse session user:', err);
    return null;
  }
}

function checkAdminAuth(user: any, req?: NextRequest) {
  if (req) {
    const cookieHeader = req.headers.get('cookie') || '';
    if (cookieHeader.includes('admin-session=')) {
      return true;
    }
  }

  if (!user) {
    return false;
  }
  
  return user.role === 'admin' || user.isAdmin === true;
}

export async function GET(request: NextRequest) {
  try {
    const sessionUser = getSessionUser(request);
    if (!checkAdminAuth(sessionUser, request)) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'pending'; // pending, approved, rejected, suspended, all

    const filter: any = {};
    if (status !== 'all') {
      if (status === 'suspended') {
        filter.$or = [{ arenaApprovalStatus: 'suspended' }, { status: 'Suspended' }];
      } else {
        filter.arenaApprovalStatus = status;
      }
    }

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const approvals = await User.find(filter)
      .select(
        'name email photoUrl status role isLabApproved arenaApprovalStatus arenaApprovalReason arenaApprovedAt arenaRejectedAt arenaAccessRequestedAt'
      )
      .sort({ arenaAccessRequestedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: approvals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
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
    const sessionUser = getSessionUser(request);
    if (!checkAdminAuth(sessionUser, request)) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { userId, action, reason } = await request.json();

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'userId and action are required' },
        { status: 400 }
      );
    }

    const validActions = ['approve', 'reject', 'suspend', 'revoke', 'suspend_account', 'unsuspend_account'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `action must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const now = new Date();
    const adminName = sessionUser?.name || "Admin";

    if (action === 'approve') {
      user.arenaApprovalStatus = "approved";
      user.isLabApproved = true;

      user.arenaAccess = {
        status: "approved",
        approved: true,
        approvedAt: now,
        rejectedAt: null,
        requestedAt: user.arenaAccess?.requestedAt || now,
        approvedBy: adminName,
        rejectionReason: "",
      };

      user.arenaApprovedAt = now;
      user.arenaApprovedBy = adminName;
      user.arenaApprovalReason = "Approved by admin";
      user.markModified("arenaAccess");

    } else if (action === 'reject' || action === 'revoke') {
      user.arenaApprovalStatus = "rejected";
      user.isLabApproved = false;

      user.arenaAccess = {
        status: "rejected",
        approved: false,
        approvedAt: null,
        rejectedAt: now,
        requestedAt: user.arenaAccess?.requestedAt || now,
        approvedBy: adminName,
        rejectionReason: reason || "Rejected by admin",
      };

      user.arenaRejectedAt = now;
      user.arenaApprovalReason = reason || "Rejected by admin";
      user.markModified("arenaAccess");

    } else if (action === 'suspend') {
      // Suspend Battle Arena access
      user.arenaApprovalStatus = "suspended";
      user.isLabApproved = false;

      user.arenaAccess = {
        status: "suspended",
        approved: false,
        approvedAt: null,
        rejectedAt: now,
        requestedAt: user.arenaAccess?.requestedAt || now,
        approvedBy: adminName,
        rejectionReason: reason || "Arena access suspended by admin",
      };

      user.arenaRejectedAt = now;
      user.arenaApprovalReason = reason || "Arena access suspended by admin";
      user.markModified("arenaAccess");

    } else if (action === 'suspend_account') {
      // Complete account suspension
      user.status = "Suspended";
      user.arenaApprovalStatus = "suspended";
      user.isLabApproved = false;

      user.arenaAccess = {
        status: "suspended",
        approved: false,
        approvedAt: null,
        rejectedAt: now,
        requestedAt: user.arenaAccess?.requestedAt || now,
        approvedBy: adminName,
        rejectionReason: reason || "Account suspended by admin",
      };

      user.arenaRejectedAt = now;
      user.arenaApprovalReason = reason || "Account suspended by admin";
      user.markModified("arenaAccess");

    } else if (action === 'unsuspend_account') {
      // Reactivate account and restore arena access
      user.status = "Active";
      user.arenaApprovalStatus = "approved";
      user.isLabApproved = true;

      user.arenaAccess = {
        status: "approved",
        approved: true,
        approvedAt: now,
        rejectedAt: null,
        requestedAt: user.arenaAccess?.requestedAt || now,
        approvedBy: adminName,
        rejectionReason: "",
      };

      user.arenaApprovedAt = now;
      user.arenaApprovedBy = adminName;
      user.arenaApprovalReason = "Account unsuspended by admin";
      user.markModified("arenaAccess");
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: `Action '${action}' applied successfully for ${user.name}`,
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
        role: user.role,
        arenaApprovalStatus: user.arenaApprovalStatus,
        arenaApprovedAt: user.arenaApprovedAt,
        arenaRejectedAt: user.arenaRejectedAt,  
        arenaApprovalReason: user.arenaApprovalReason,
      },
    });
  } catch (error: any) {
    console.error('Arena approval action error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update arena approval' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/arena-approvals - Bulk actions
 */
export async function PUT(request: NextRequest) {
  try {
    const sessionUser = getSessionUser(request);
    if (!checkAdminAuth(sessionUser, request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userIds, action, reason } = await request.json();

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: "userIds array is required" }, { status: 400 });
    }

    await dbConnect();
    const now = new Date();
    const updateData: any = {};

    if (action === "approve") {
      updateData.arenaApprovalStatus = "approved";
      updateData.isLabApproved = true;
      updateData.arenaApprovedAt = now;
      updateData.arenaApprovalReason = "Approved by admin";
      updateData.arenaRejectedAt = null;

      updateData.arenaAccess = {
        status: "approved",
        approved: true,
        approvedAt: now,
        rejectedAt: null,
        requestedAt: now,
        approvedBy: sessionUser?.name || "Admin",
        rejectionReason: "",
      };
    } else if (action === "reject" || action === "revoke") {
      updateData.arenaApprovalStatus = "rejected";
      updateData.isLabApproved = false;
      updateData.arenaRejectedAt = now;
      updateData.arenaApprovalReason = reason || "Rejected by admin";

      updateData.arenaAccess = {
        status: "rejected",
        approved: false,
        approvedAt: null,
        rejectedAt: now,
        requestedAt: now,
        approvedBy: sessionUser?.name || "Admin",
        rejectionReason: reason || "Rejected by admin",
      };
    } else if (action === "suspend") {
      updateData.arenaApprovalStatus = "suspended";
      updateData.isLabApproved = false;
      updateData.arenaRejectedAt = now;
      updateData.arenaApprovalReason = reason || "Arena access suspended by admin";

      updateData.arenaAccess = {
        status: "suspended",
        approved: false,
        approvedAt: null,
        rejectedAt: now,
        requestedAt: now,
        approvedBy: sessionUser?.name || "Admin",
        rejectionReason: reason || "Arena access suspended by admin",
      };
    } else if (action === "suspend_account") {
      updateData.status = "Suspended";
      updateData.arenaApprovalStatus = "suspended";
      updateData.isLabApproved = false;
      updateData.arenaRejectedAt = now;
      updateData.arenaApprovalReason = reason || "Account suspended by admin";

      updateData.arenaAccess = {
        status: "suspended",
        approved: false,
        approvedAt: null,
        rejectedAt: now,
        requestedAt: now,
        approvedBy: sessionUser?.name || "Admin",
        rejectionReason: reason || "Account suspended by admin",
      };
    } else if (action === "unsuspend_account") {
      updateData.status = "Active";
      updateData.arenaApprovalStatus = "approved";
      updateData.isLabApproved = true;
      updateData.arenaApprovedAt = now;
      updateData.arenaApprovalReason = "Account unsuspended by admin";
      updateData.arenaRejectedAt = null;

      updateData.arenaAccess = {
        status: "approved",
        approved: true,
        approvedAt: now,
        rejectedAt: null,
        requestedAt: now,
        approvedBy: sessionUser?.name || "Admin",
        rejectionReason: "",
      };
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: updateData }
    );

    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (err: any) {
    console.error("Bulk approval error:", err);
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
    const sessionUser = getSessionUser(request);
    if (!checkAdminAuth(sessionUser, request)) {
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
          arenaApprovalStatus: "approved",
          arenaApprovedAt: new Date(),
          arenaRejectedAt: null,
          arenaApprovalReason: "Reset to approved by admin",
          isLabApproved: true,
          status: "Active",
          arenaAccess: {
            status: "approved",
            approved: true,
            approvedAt: new Date(),
            rejectedAt: null,
            requestedAt: new Date(),
            approvedBy: sessionUser?.name || "Admin",
            rejectionReason: "",
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
      message: 'Arena approval status reset to approved',
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
