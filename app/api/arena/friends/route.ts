import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  try {
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Fetch friend user details
    const friends = await User.find({ _id: { $in: user.friends || [] } }, { name: 1, photoUrl: 1, email: 1, arenaRank: 1, level: 1, isOnline: 1, status: 1 });
    const requests = await User.find({ _id: { $in: user.friendRequests || [] } }, { name: 1, photoUrl: 1, email: 1, arenaRank: 1, level: 1 });

    return NextResponse.json({ friends, requests });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  const { action, userId, friendId } = body;

  if (!userId || !friendId) return NextResponse.json({ error: 'userId and friendId required' }, { status: 400 });

  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) return NextResponse.json({ error: 'User or friend not found' }, { status: 404 });

    if (action === 'request') {
      if (friend.friendRequests.includes(userId)) {
        return NextResponse.json({ error: 'Request already sent' }, { status: 400 });
      }
      friend.friendRequests.push(userId);
      await friend.save();
      return NextResponse.json({ success: true, message: 'Request sent' });
    }

    if (action === 'accept') {
      // Remove from friend requests
      user.friendRequests = user.friendRequests.filter((id: string) => id !== friendId);
      
      // Add to friends for both
      if (!user.friends.includes(friendId)) user.friends.push(friendId);
      if (!friend.friends.includes(userId)) friend.friends.push(userId);

      // Automatically follow each other
      if (!user.following.includes(friendId)) user.following.push(friendId);
      if (!friend.following.includes(userId)) friend.following.push(userId);
      if (!user.followers.includes(friendId)) user.followers.push(friendId);
      if (!friend.followers.includes(userId)) friend.followers.push(userId);

      await user.save();
      await friend.save();
      return NextResponse.json({ success: true, message: 'Friend request accepted' });
    }

    if (action === 'decline') {
      user.friendRequests = user.friendRequests.filter((id: string) => id !== friendId);
      await user.save();
      return NextResponse.json({ success: true, message: 'Friend request declined' });
    }

    if (action === 'remove') {
      user.friends = user.friends.filter((id: string) => id !== friendId);
      friend.friends = friend.friends.filter((id: string) => id !== userId);
      await user.save();
      await friend.save();
      return NextResponse.json({ success: true, message: 'Friend removed' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
