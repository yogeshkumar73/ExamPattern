import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

const RANK_THRESHOLDS = [
  { rank: 'Grandmaster', min: 5000 },
  { rank: 'Master', min: 3000 },
  { rank: 'Diamond', min: 2000 },
  { rank: 'Platinum', min: 1000 },
  { rank: 'Gold', min: 500 },
  { rank: 'Silver', min: 200 },
  { rank: 'Bronze', min: 0 },
];

function computeArenaRank(ap: number) {
  return RANK_THRESHOLDS.find(r => ap >= r.min)?.rank || 'Unranked';
}

function computeLevel(xp: number) {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

// POST /api/arena/battle — record battle result and update user stats
export async function findUserById(userId: string, projection: Record<string, unknown> = {}) {
  if (mongoose.isValidObjectId(userId)) {
    return User.findById(userId, projection);
  }
  return User.findOne({ _id: userId }, projection);
}

async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  const { userId, result, mode, difficulty, score, accuracy, xpGained, pointsGained, opponentName, battleId } = body;

  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  try {
    let user = await findUserById(userId);
    
    // If not found in DB, check mock users
    if (!user) {
      const { mockUsers } = await import('@/lib/mockDb');
      const mockUser = mockUsers.find((u: any) => u._id === userId);
      if (!mockUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      // Initialize mock user battle stats if needed
      if (!mockUser.totalBattles) mockUser.totalBattles = 0;
      if (!mockUser.wins) mockUser.wins = 0;
      if (!mockUser.losses) mockUser.losses = 0;
      if (!mockUser.draws) mockUser.draws = 0;
      if (!mockUser.battleHistory) mockUser.battleHistory = [];
      user = mockUser;
    }

    // Update battle stats
    user.totalBattles = (user.totalBattles || 0) + 1;
    if (result === 'win') {
      user.wins = (user.wins || 0) + 1;
      user.currentStreak = (user.currentStreak || 0) + 1;
      user.bestStreak = Math.max(user.bestStreak || 0, user.currentStreak);
    } else if (result === 'loss') {
      user.losses = (user.losses || 0) + 1;
      user.currentStreak = 0;
    } else {
      user.draws = (user.draws || 0) + 1;
    }

    // Win rate
    user.winRate = user.totalBattles > 0
      ? Math.round((user.wins / user.totalBattles) * 100) : 0;

    // XP, Points, Coins
    user.xp = (user.xp || 0) + (xpGained || 0);
    user.points = (user.points || 0) + (pointsGained || 0);
    user.coins = (user.coins || 0) + Math.floor((xpGained || 0) / 10);
    user.arenaPoints = (user.arenaPoints || 0) + (result === 'win' ? pointsGained || 0 : result === 'loss' ? -Math.floor((pointsGained || 0) * 0.3) : 0);
    user.arenaPoints = Math.max(0, user.arenaPoints);
    user.arenaRank = computeArenaRank(user.arenaPoints);
    user.level = computeLevel(user.xp);

    // Per-category stats
    if (!user.gameStats) user.gameStats = {};
    if (mode && mode !== 'mixed') {
      if (!user.gameStats[mode]) user.gameStats[mode] = { wins: 0, losses: 0, xp: 0 };
      user.gameStats[mode].xp = (user.gameStats[mode].xp || 0) + (xpGained || 0);
      if (result === 'win') user.gameStats[mode].wins = (user.gameStats[mode].wins || 0) + 1;
      else if (result === 'loss') user.gameStats[mode].losses = (user.gameStats[mode].losses || 0) + 1;
    }

    // Accuracy tracking
    user.totalCorrect = (user.totalCorrect || 0) + Math.round(((accuracy || 0) / 100) * 5);
    user.totalAttempted = (user.totalAttempted || 0) + 5;
    user.accuracy = user.totalAttempted > 0
      ? Math.round((user.totalCorrect / user.totalAttempted) * 100) : 0;

    // Battle history (keep last 20)
    if (!user.battleHistory) user.battleHistory = [];
    user.battleHistory.unshift({
      battleId: battleId || `battle-${Date.now()}`,
      mode, difficulty, result, xpGained: xpGained || 0,
      pointsGained: pointsGained || 0, opponentName, score, accuracy,
      timestamp: new Date(),
    });
    user.battleHistory = user.battleHistory.slice(0, 20);

    // Legacy rank update
    if (user.points >= 1000) user.rank = 'Platinum';
    else if (user.points >= 500) user.rank = 'Gold';
    else if (user.points >= 200) user.rank = 'Silver';
    else user.rank = 'Bronze';

    // Only save to DB if it's a real user (has _id as ObjectId), not a mock
    if (mongoose.isValidObjectId(user._id)) {
      await user.save();
    }
    // For mock users, data persists in memory in mockUsers array

    return NextResponse.json({
      success: true,
      newXP: user.xp,
      newLevel: user.level,
      newArenaRank: user.arenaRank,
      newArenaPoints: user.arenaPoints,
      newWinRate: user.winRate,
      newStreak: user.currentStreak,
    });
  } catch (err: any) {
    console.error('POST /api/arena/battle error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET /api/arena/battle — get battle history for user
export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  try {
    const user = await findUserById(userId, { battleHistory: 1, wins: 1, losses: 1, totalBattles: 1 });
    
    if (!user) {
      // Check if it's a mock user (when MongoDB is unavailable)
      const { mockUsers } = await import('@/lib/mockDb');
      const mockUser = mockUsers.find((u: any) => u._id === userId);
      if (mockUser) {
        return NextResponse.json({ 
          battleHistory: mockUser.battleHistory || [], 
          stats: { wins: mockUser.wins || 0, losses: mockUser.losses || 0, total: mockUser.totalBattles || 0 } 
        });
      }
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ battleHistory: user?.battleHistory || [], stats: { wins: user?.wins, losses: user?.losses, total: user?.totalBattles } });
  } catch (err: any) {
    console.error('GET /api/arena/battle error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
