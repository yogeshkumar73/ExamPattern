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
    if (header) return JSON.parse(decodeURIComponent(header));
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
      user.arenaApprovalStatus = 'approved';
      user.arenaApprovedAt = new Date();
      user.arenaApprovedBy = sessionUser?.name || 'Admin'; // Store admin name
      user.arenaApprovalReason = '';
    } else if (action === 'reject') {
      user.arenaApprovalStatus = 'rejected';
      user.arenaRejectedAt = new Date();
      user.arenaApprovalReason = reason || 'Rejected by admin';
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
    // Check admin authentication
    const sessionUser = getSessionUser(request);
    if (!checkAdminAuth(sessionUser)) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { userIds, action, reason } = await request.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'userIds array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Bulk update
    const updateData =
      action === 'approve'
        ? {
            arenaApprovalStatus: 'approved',
            arenaApprovedAt: new Date(),
            arenaApprovedBy: sessionUser?.name || 'Admin',
            arenaApprovalReason: '',
          }
        : {
            arenaApprovalStatus: 'rejected',
            arenaRejectedAt: new Date(),
            arenaApprovalReason: reason || 'Rejected by admin',
          };

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: updateData }
    );

    return NextResponse.json({
      success: true,
      message: `Arena access ${action}ed for ${result.modifiedCount} users`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error: any) {
    console.error('Bulk arena approval error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update arena approvals' },
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
          arenaApprovalStatus: 'pending',
          arenaApprovedAt: null,
          arenaRejectedAt: null,
          arenaApprovalReason: '',
          arenaAccessRequestedAt: new Date(),
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
