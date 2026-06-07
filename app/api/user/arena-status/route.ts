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
  return User.findOne({ _id: userId });
}

export async function GET(request: NextRequest) {
  try {
    // Get user ID from query params or session
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await findUserById(userId).select(
      'name email arenaApprovalStatus arenaApprovalReason arenaApprovedAt arenaRejectedAt arenaAccessRequestedAt'
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        arenaApprovalStatus: user.arenaApprovalStatus,
        arenaApprovalReason: user.arenaApprovalReason,
        arenaApprovedAt: user.arenaApprovedAt,
        arenaRejectedAt: user.arenaRejectedAt,
        arenaAccessRequestedAt: user.arenaAccessRequestedAt,
        isApproved: user.arenaApprovalStatus === 'approved',
        isRejected: user.arenaApprovalStatus === 'rejected',
        isPending: user.arenaApprovalStatus === 'pending',
      },
    });
  } catch (error: any) {
    console.error('Arena status check error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch arena status' },
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
    if (user.arenaApprovalStatus === 'approved') {
      return NextResponse.json(
        {
          success: true,
          message: 'You already have arena access approved',
          isApproved: true,
        },
        { status: 200 }
      );
    }

    // If already pending, don't create duplicate request
    if (user.arenaApprovalStatus === 'pending') {
      return NextResponse.json(
        {
          success: true,
          message: 'Your arena access request is still pending admin review',
          isPending: true,
        },
        { status: 200 }
      );
    }

    // If rejected, allow to request again
    user.arenaApprovalStatus = 'pending';
    user.arenaAccessRequestedAt = new Date();
    user.arenaApprovalReason = '';
    user.arenaRejectedAt = null;

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Arena access request submitted. Please wait for admin approval.',
      data: {
        userId: user._id,
        name: user.name,
        arenaApprovalStatus: user.arenaApprovalStatus,
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
