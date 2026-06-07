import { NextRequest, NextResponse } from 'next/server';
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

function computeArenaRank(arenaPoints: number) {
  return RANK_THRESHOLDS.find(r => arenaPoints >= r.min)?.rank || 'Unranked';
}

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || 'global';
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

  let sortField: Record<string, number> = { arenaPoints: -1 };
  if (category === 'coding')     sortField = { 'gameStats.coding.xp': -1 };
  if (category === 'puzzle')     sortField = { 'gameStats.puzzle.xp': -1 };
  if (category === 'math')       sortField = { 'gameStats.math.xp': -1 };
  if (category === 'gk')         sortField = { 'gameStats.gk.xp': -1 };
  if (category === 'prediction') sortField = { 'gameStats.prediction.xp': -1 };
  if (category === 'battle')     sortField = { wins: -1 };
  if (category === 'xp')         sortField = { xp: -1 };

  try {
    const users = await User.find({ status: 'Active' }, {
      name: 1, photoUrl: 1, arenaPoints: 1, arenaRank: 1, xp: 1, level: 1,
      wins: 1, losses: 1, winRate: 1, badges: 1, gameStats: 1, totalBattles: 1,
      currentStreak: 1, accuracy: 1,
    }).sort(sortField).limit(limit);

    const leaderboard = users.map((u: any, i: number) => ({
      rank: i + 1,
      userId: u._id,
      name: u.name,
      avatar: u.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=6366f1&color=fff`,
      arenaPoints: u.arenaPoints || 0,
      arenaRank: computeArenaRank(u.arenaPoints || 0),
      xp: u.xp || 0,
      level: u.level || 1,
      wins: u.wins || 0,
      losses: u.losses || 0,
      winRate: u.winRate || 0,
      badges: u.badges || [],
      totalBattles: u.totalBattles || 0,
      currentStreak: u.currentStreak || 0,
      accuracy: u.accuracy || 0,
      categoryXP: category !== 'global' ? u.gameStats?.[category]?.xp || 0 : undefined,
    }));

    return NextResponse.json({ leaderboard, category, total: leaderboard.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
