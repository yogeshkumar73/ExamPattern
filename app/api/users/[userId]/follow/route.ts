import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import dbConnect from '@/lib/mongodb';
import Follower from '@/models/Follower';
import User from '@/models/User';

/**
 * GET /api/users/[userId]/follow - Check if user is following, and get follower/following counts
 * Query params: currentUserId
 */
export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const userId = params.userId;
    const currentUserId = request.nextUrl.searchParams.get('currentUserId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get follower/following counts
    const [followerCount, followingCount, isFollowing] = await Promise.all([
      Follower.countDocuments({ userId: new ObjectId(userId) }),
      Follower.countDocuments({ followerId: new ObjectId(userId) }),
      currentUserId
        ? Follower.findOne({
            userId: new ObjectId(userId),
            followerId: new ObjectId(currentUserId),
          })
        : null,
    ]);

    return NextResponse.json({
      success: true,
      userId,
      followers: followerCount,
      following: followingCount,
      isFollowing: !!isFollowing,
    });
  } catch (error: any) {
    console.error('Get follow status error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get follow status' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users/[userId]/follow - Follow a user
 */
export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const userId = params.userId;
    const { currentUserId } = await request.json();

    if (!currentUserId) {
      return NextResponse.json(
        { error: 'currentUserId is required' },
        { status: 400 }
      );
    }

    // Prevent self-follow
    if (userId === currentUserId) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if both users exist
    const [targetUser, currentUser] = await Promise.all([
      User.findById(userId),
      User.findById(currentUserId),
    ]);

    if (!targetUser || !currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Try to create follow relationship
    try {
      await Follower.create({
        userId: new ObjectId(userId),
        followerId: new ObjectId(currentUserId),
      });

      return NextResponse.json({
        success: true,
        message: `Now following ${targetUser.name}`,
      });
    } catch (error: any) {
      if (error.code === 11000) {
        // Already following
        return NextResponse.json(
          { error: 'Already following this user' },
          { status: 409 }
        );
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Follow error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to follow user' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[userId]/follow - Unfollow a user
 */
export async function DELETE(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const userId = params.userId;
    const { currentUserId } = await request.json();

    if (!currentUserId) {
      return NextResponse.json(
        { error: 'currentUserId is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Delete follow relationship
    const follow = await Follower.findOneAndDelete({
      userId: new ObjectId(userId),
      followerId: new ObjectId(currentUserId),
    });

    if (!follow) {
      return NextResponse.json(
        { error: 'Not following this user' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Unfollowed user',
    });
  } catch (error: any) {
    console.error('Unfollow error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to unfollow user' },
      { status: 500 }
    );
  }
}
