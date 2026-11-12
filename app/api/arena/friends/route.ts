import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { createNotification, markNotificationRead, deleteNotification } from '@/lib/services/notificationService';

function parseIds(ids: any[]) {
  if (!Array.isArray(ids)) return { validObjectIds: [], stringIds: [] };
  const validObjectIds: mongoose.Types.ObjectId[] = [];
  const stringIds: string[] = [];

  for (const item of ids) {
    if (!item) continue;
    const s = String(item).trim();
    if (mongoose.isValidObjectId(s)) {
      validObjectIds.push(new mongoose.Types.ObjectId(s));
    } else {
      stringIds.push(s);
    }
  }
  return { validObjectIds, stringIds };
}

async function findUser(id: string) {
  if (!id) return null;
  try {
    if (mongoose.isValidObjectId(id)) {
      const u = await User.findById(id);
      if (u) return u;
    }
    return await User.findOne({ $or: [{ customId: id }, { email: id }, { name: id }] });
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ friends: [], requests: [], duelChallenges: [] }, { status: 200 });
    }

    try {
      await dbConnect();
    } catch (connErr) {
      console.warn("MongoDB connection failed in friends GET:", connErr);
      return NextResponse.json({ friends: [], requests: [], duelChallenges: [] }, { status: 200 });
    }

    const user = await findUser(userId);
    if (!user) {
      return NextResponse.json({ friends: [], requests: [], duelChallenges: [] }, { status: 200 });
    }

    // Safely parse friends and requests IDs to prevent Mongoose CastErrors
    const { validObjectIds: friendObjIds, stringIds: friendStrIds } = parseIds(user.friends || []);
    const { validObjectIds: reqObjIds, stringIds: reqStrIds } = parseIds(user.friendRequests || []);

    let friends: any[] = [];
    if (friendObjIds.length > 0 || friendStrIds.length > 0) {
      const orClauses: any[] = [];
      if (friendObjIds.length > 0) orClauses.push({ _id: { $in: friendObjIds } });
      if (friendStrIds.length > 0) {
        orClauses.push({ customId: { $in: friendStrIds } });
        orClauses.push({ email: { $in: friendStrIds } });
        orClauses.push({ name: { $in: friendStrIds } });
      }
      try {
        friends = await User.find(
          { $or: orClauses },
          { name: 1, photoUrl: 1, email: 1, arenaRank: 1, level: 1, isOnline: 1, status: 1, country: 1, countryCode: 1, city: 1, stream: 1, course: 1, branch: 1, wins: 1, losses: 1, xp: 1, arenaPoints: 1, elo: 1, badges: 1, currentStreak: 1, accuracy: 1 }
        ).lean();
      } catch (fErr) {
        console.warn("Error fetching friends list:", fErr);
      }
    }

    let requests: any[] = [];
    if (reqObjIds.length > 0 || reqStrIds.length > 0) {
      const orClauses: any[] = [];
      if (reqObjIds.length > 0) orClauses.push({ _id: { $in: reqObjIds } });
      if (reqStrIds.length > 0) {
        orClauses.push({ customId: { $in: reqStrIds } });
        orClauses.push({ email: { $in: reqStrIds } });
        orClauses.push({ name: { $in: reqStrIds } });
      }
      try {
        requests = await User.find(
          { $or: orClauses },
          { name: 1, photoUrl: 1, email: 1, arenaRank: 1, level: 1, country: 1, countryCode: 1, city: 1, stream: 1, course: 1, branch: 1, wins: 1, losses: 1, xp: 1, arenaPoints: 1, elo: 1, badges: 1, currentStreak: 1, accuracy: 1 }
        ).lean();
      } catch (rErr) {
        console.warn("Error fetching friend requests:", rErr);
      }
    }

    // Fetch incoming unread duel challenges
    let duelChallenges: any[] = [];
    try {
      const recipientConditions: any[] = [];
      if (user._id) recipientConditions.push({ userId: String(user._id) });
      if (userId) recipientConditions.push({ userId: String(userId) });
      if (user.email) recipientConditions.push({ recipientEmail: user.email });

      if (recipientConditions.length > 0) {
        const rawChallenges = await Notification.find({
          $or: recipientConditions,
          category: 'battle_challenge',
          isRead: false,
        }).sort({ createdAt: -1 }).limit(10).lean();

        duelChallenges = (rawChallenges || []).map((chal: any) => {
          const urlParams = new URLSearchParams((chal.actionUrl || '').split('?')[1] || '');
          return {
            ...chal,
            duelId: urlParams.get('duelId') || '',
            mode: urlParams.get('mode') || 'math',
            difficulty: urlParams.get('difficulty') || 'intermediate',
            challengerName: urlParams.get('challengerName') || chal.senderName,
            challengerPhotoUrl: chal.senderPhotoUrl,
          };
        });
      }
    } catch (notifErr) {
      console.warn("Notification query skipped:", notifErr);
    }

    return NextResponse.json({ friends, requests, duelChallenges }, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/arena/friends error:", err);
    return NextResponse.json({ friends: [], requests: [], duelChallenges: [] }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { action, userId, friendId, notificationId } = body;

    if (!userId || !friendId) {
      return NextResponse.json({ error: 'userId and friendId required' }, { status: 400 });
    }

    const user = (await findUser(userId)) || { _id: userId, name: body.userName || 'Student', email: body.userEmail || '' };
    const friend = (await findUser(friendId)) || { _id: friendId, name: body.friendName || 'Friend', email: body.friendEmail || '' };

    // Handle 1v1 Battle Arena Duel Challenge
    if (action === 'challenge' || action === 'duel') {
      const mode = body.mode || 'math';
      const difficulty = body.difficulty || 'intermediate';
      const activeDuelId = body.duelId || `duel-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      
      const modeLabels: Record<string, string> = {
        coding: 'Coding Battle',
        puzzle: 'Puzzle Battle',
        math: 'Math Battle',
        gk: 'GK Battle',
        prediction: 'Prediction Game',
        color: 'Color Match Battle',
        mixed: 'Mixed Mode',
      };
      const modeLabel = modeLabels[mode] || mode.toUpperCase();
      const diffLabel = (difficulty.charAt(0).toUpperCase() + difficulty.slice(1));

      const actionUrl = `/?step=arena&tab=friends&duel=1&duelId=${activeDuelId}&mode=${mode}&difficulty=${difficulty}&challengerId=${user._id}&challengerName=${encodeURIComponent(user.name || 'Friend')}`;

      const notification = await createNotification({
        userId: String(friend._id),
        recipientEmail: friend.email || '',
        recipientName: friend.name || '',
        senderId: String(user._id),
        senderName: user.name || 'Aura Player',
        senderPhotoUrl: user.photoUrl || user.avatar || '',
        senderEmail: user.email || '',
        title: `⚔️ 1v1 Duel: ${user.name || 'Friend'} [${modeLabel}]`,
        message: `Challenged you to a 1v1 ${modeLabel} (${diffLabel}). Tap to accept and battle!`,
        category: 'battle_challenge',
        priority: 'high',
        actionUrl,
      });

      return NextResponse.json({
        success: true,
        message: `Challenge request successfully sent to ${friend.name}!`,
        notification,
        duelId: activeDuelId,
        mode,
        difficulty,
      });
    }

    if (action === 'accept_duel') {
      if (notificationId) {
        await markNotificationRead(notificationId).catch(() => {});
      }
      return NextResponse.json({ success: true, message: 'Duel accepted' });
    }

    if (action === 'decline_duel') {
      if (notificationId) {
        await deleteNotification(notificationId).catch(() => {});
      }
      return NextResponse.json({ success: true, message: 'Duel declined' });
    }

    if (action === 'request') {
      if (!friend.friendRequests) friend.friendRequests = [];
      if (friend.friendRequests.includes(userId)) {
        return NextResponse.json({ error: 'Request already sent' }, { status: 400 });
      }
      friend.friendRequests.push(userId);
      if (typeof friend.save === 'function') await friend.save();
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
      user.friendRequests = user.friendRequests.filter((id: string) => String(id) !== String(friendId));
      
      // Add to friends for both
      if (!user.friends.map(String).includes(String(friendId))) user.friends.push(String(friendId));
      if (!friend.friends.map(String).includes(String(userId))) friend.friends.push(String(userId));

      // Automatically follow each other
      if (!user.following.map(String).includes(String(friendId))) user.following.push(String(friendId));
      if (!friend.following.map(String).includes(String(userId))) friend.following.push(String(userId));
      if (!user.followers.map(String).includes(String(friendId))) user.followers.push(String(friendId));
      if (!friend.followers.map(String).includes(String(userId))) friend.followers.push(String(userId));

      if (typeof user.save === 'function') await user.save();
      if (typeof friend.save === 'function') await friend.save();
      return NextResponse.json({ success: true, message: 'Friend request accepted' });
    }

    if (action === 'decline') {
      if (!user.friendRequests) user.friendRequests = [];
      user.friendRequests = user.friendRequests.filter((id: string) => String(id) !== String(friendId));
      if (typeof user.save === 'function') await user.save();
      return NextResponse.json({ success: true, message: 'Friend request declined' });
    }

    if (action === 'remove') {
      if (!user.friends) user.friends = [];
      if (!friend.friends) friend.friends = [];
      user.friends = user.friends.filter((id: string) => String(id) !== String(friendId));
      friend.friends = friend.friends.filter((id: string) => String(id) !== String(userId));
      if (typeof user.save === 'function') await user.save();
      if (typeof friend.save === 'function') await friend.save();
      return NextResponse.json({ success: true, message: 'Friend removed' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error("POST /api/arena/friends error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
