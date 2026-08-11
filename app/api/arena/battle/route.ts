import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

const RANK_THRESHOLDS = [
  { rank: "Grandmaster", min: 5000 },
  { rank: "Master", min: 3000 },
  { rank: "Diamond", min: 2000 },
  { rank: "Platinum", min: 1500 },
  { rank: "Gold", min: 1200 },
  { rank: "Silver", min: 1000 },
  { rank: "Bronze", min: 800 },
];

function computeArenaRank(points: number): string {
  for (const tier of RANK_THRESHOLDS) {
    if (points >= tier.min) return tier.rank;
  }

  return "Unranked";
}

function computeLevel(xp: number): number {
  return Math.max(1, Math.floor(Math.sqrt(xp / 100)) + 1);
}


// POST /api/arena/battle — record battle result and update user stats
export async function findUserById(userId: string, projection: Record<string, unknown> = {}) {
  if (mongoose.isValidObjectId(userId)) {
    return User.findById(userId, projection);
  }
  return User.findOne({ _id: userId }, projection);
}

export async function POST(req: NextRequest) {
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

    // =====================================================
    // Battle Statistics
    // NOTE: totalBattles and winRate are recomputed by the
    // Mongoose pre-save hook — do NOT set them here.
    // =====================================================

    switch (result) {
      case "win":
        user.wins = (user.wins ?? 0) + 1;
        user.currentStreak = (user.currentStreak ?? 0) + 1;
        user.bestStreak = Math.max(
          user.bestStreak ?? 0,
          user.currentStreak
        );
        break;

      case "loss":
        user.losses = (user.losses ?? 0) + 1;
        user.currentStreak = 0;
        break;

      default:
        user.draws = (user.draws ?? 0) + 1;
    }

    // For mock users (no Mongoose pre-save hook), compute derived fields manually.
    if (typeof (user as any).save !== "function") {
      user.totalBattles = (user.wins ?? 0) + (user.losses ?? 0) + (user.draws ?? 0);
      user.winRate = user.totalBattles > 0
        ? Math.min(100, Number(((user.wins / user.totalBattles) * 100).toFixed(2)))
        : 0;
    }

    // =====================================================
    // XP
    // =====================================================

    const earnedXP = Number(xpGained ?? 0);

    user.xp = (user.xp ?? 0) + earnedXP;

    user.level = computeLevel(user.xp);

    // =====================================================
    // Coins
    // =====================================================

    user.coins =
      (user.coins ?? 0) +
      Math.floor(earnedXP / 10);

    // =====================================================
    // Legacy Points
    // =====================================================

    user.points =
      (user.points ?? 0) +
      Number(pointsGained ?? 0);

    // Per-category stats
    if (!user.gameStats) user.gameStats = {};
    if (mode && mode !== 'mixed') {
      if (!user.gameStats[mode]) user.gameStats[mode] = { wins: 0, losses: 0, xp: 0 };
      user.gameStats[mode].xp = (user.gameStats[mode].xp || 0) + (xpGained || 0);
      if (result === 'win') user.gameStats[mode].wins = (user.gameStats[mode].wins || 0) + 1;
      else if (result === 'loss') user.gameStats[mode].losses = (user.gameStats[mode].losses || 0) + 1;
    }

    // Accuracy tracking
    const totalQuestions =
      Number(body.totalQuestions ?? 5);

    const correctAnswers =
      Number(
        body.correctAnswers ??
        Math.round((accuracy / 100) * totalQuestions)
      );

    user.totalCorrect =
      (user.totalCorrect ?? 0) +
      correctAnswers;

    user.totalAttempted =
      (user.totalAttempted ?? 0) +
      totalQuestions;

    user.accuracy =
      user.totalAttempted === 0
        ? 0
        : Number(
          (
            (user.totalCorrect /
              user.totalAttempted) *
            100
          ).toFixed(2)
        );

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

    // ── 3. Update Python Battle Service ELO/Leaderboard ─────
    const BATTLE_SERVICE_URL =
      process.env.BATTLE_SERVICE_URL || "http://localhost:8001";

    try {
      const res = await fetch(`${BATTLE_SERVICE_URL}/api/leaderboard/result`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          player_id: userId,
          player_name: user.name || "Player",
          opponent_id: null,
          won: result === "win",
          mode: mode || "mixed",
          difficulty: difficulty || "beginner",
          correct_answers: Math.round(((accuracy || 0) / 100) * 20),
          total_questions: 20,
          xp_earned: xpGained || 0,
          coins_earned: Math.floor((xpGained || 0) / 40),
        }),
        signal: AbortSignal.timeout(3000),
      });

      if (!res.ok) {
        console.warn(
          `[BattleRoute] Python service returned ${res.status}: ${res.statusText}`
        );
      } else {
        const pyData = await res.json();

        if (pyData?.success && pyData?.data) {
          const {
            new_elo,
            new_xp,
            new_coins,
            new_level,
            new_streak,
          } = pyData.data;

          user.arenaPoints = new_elo;
          user.xp = new_xp;
          user.coins = new_coins;
          user.level = new_level;
          user.currentStreak = new_streak;

          user.arenaRank = computeArenaRank(new_elo);

          console.log(
            `[BattleRoute] Synced player ${userId} | ELO: ${new_elo} | XP: ${new_xp} | Level: ${new_level}`
          );
        } else {
          console.warn(
            "[BattleRoute] Python service returned an unexpected response:",
            pyData
          );
        }
      }
    } catch (err) {
      console.warn(
        "[BattleRoute] Python Battle Service result update skipped/failed:",
        err instanceof Error ? err.message : err
      );
    }    // Only save to DB if it's a real user (has _id as ObjectId), not a mock
    if (typeof (user as any).save === "function") {
      await (user as any).save();
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
