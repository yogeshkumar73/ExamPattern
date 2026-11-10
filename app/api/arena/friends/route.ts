import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { createNotification, markNotificationRead, deleteNotification } from '@/lib/services/notificationService';

async function findUser(id: string) {
  if (!id) return null;
  if (mongoose.isValidObjectId(id)) {
    return await User.findById(id);
  }
  return await User.findOne({ $or: [{ customId: id }, { email: id }] });
}

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  try {
    const user = await findUser(userId);
    if (!user) {
      return NextResponse.json({ friends: [], requests: [], duelChallenges: [] });
    }

    // Fetch friend user details
    const friends = await User.find({ _id: { $in: user.friends || [] } }, { name: 1, photoUrl: 1, email: 1, arenaRank: 1, level: 1, isOnline: 1, status: 1 });
    const requests = await User.find({ _id: { $in: user.friendRequests || [] } }, { name: 1, photoUrl: 1, email: 1, arenaRank: 1, level: 1 });

    // Fetch incoming unread duel challenges
    let duelChallenges: any[] = [];
    try {
      duelChallenges = await Notification.find({
        $or: [
          { userId: user._id.toString() },
          { recipientEmail: user.email },
        ],
        category: 'battle_challenge',
        isRead: false,
      }).sort({ createdAt: -1 }).limit(10);
    } catch (_) {}

    return NextResponse.json({ friends, requests, duelChallenges });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  const { action, userId, friendId, notificationId } = body;

  if (!userId || !friendId) return NextResponse.json({ error: 'userId and friendId required' }, { status: 400 });

  try {
    const user = (await findUser(userId)) || { _id: userId, name: body.userName || 'Student', email: body.userEmail || '' };
    const friend = (await findUser(friendId)) || { _id: friendId, name: body.friendName || 'Friend', email: body.friendEmail || '' };

    // Handle 1v1 Battle Arena Duel Challenge
    if (action === 'challenge' || action === 'duel') {
      const notification = await createNotification({
        userId: friend._id.toString(),
        recipientEmail: friend.email || '',
        recipientName: friend.name || '',
        senderId: user._id.toString(),
        senderName: user.name || 'Aura Player',
        senderPhotoUrl: user.photoUrl || '',
        senderEmail: user.email || '',
        title: `⚔️ Duel: ${user.name || 'Friend'}`,
        message: `Challenged you to a 1v1 Arena duel.`,
        category: 'battle_challenge',
        priority: 'high',
        actionUrl: '/?step=arena&tab=friends&duel=1',
      });

      return NextResponse.json({
        success: true,
        message: `Challenge request successfully sent to ${friend.name}!`,
        notification,
      });
    }

    if (action === 'accept_duel') {
      if (notificationId) {
        await markNotificationRead(notificationId);
      }
      return NextResponse.json({ success: true, message: 'Duel accepted' });
    }

    if (action === 'decline_duel') {
      if (notificationId) {
        await deleteNotification(notificationId);
      }
      return NextResponse.json({ success: true, message: 'Duel declined' });
    }

    if (action === 'request') {
      if (!friend.friendRequests) friend.friendRequests = [];
      if (friend.friendRequests.includes(userId)) {
        return NextResponse.json({ error: 'Request already sent' }, { status: 400 });
      }
      friend.friendRequests.push(userId);
      await friend.save();
      return NextResponse.json({ success: true, message: 'Request sent' });
    }

    if (action === 'accept') {
      if (!user.friendRequests) user.friendRequests = [];
      if (!user.friends) user.friends = [];
      if (!friend.friends) friend.friends = [];
      if (!user.following) user.following = [];
      if (!friend.following) friend.following = [];
      if (!user.followers) user.followers = [];
      if (!friend.followers) friend.followers = [];

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
      if (!user.friendRequests) user.friendRequests = [];
      user.friendRequests = user.friendRequests.filter((id: string) => id !== friendId);
      await user.save();
      return NextResponse.json({ success: true, message: 'Friend request declined' });
    }

    if (action === 'remove') {
      if (!user.friends) user.friends = [];
      if (!friend.friends) friend.friends = [];
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
