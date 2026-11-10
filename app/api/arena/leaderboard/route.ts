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
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || 'global';
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));

  // ── 1. Python Battle Service (primary) ───────────────────
  const BATTLE_SERVICE_URL = process.env.BATTLE_SERVICE_URL || ['http://', 'localhost:8001'].join('');
  const isPythonSupportedCategory = [
    'global',
    'coding',
    'puzzle',
    'math',
    'gk',
    'prediction'
  ].includes(category);

  if (isPythonSupportedCategory) {
    try {
      const endpoint = category === 'global'
        ? `${BATTLE_SERVICE_URL}/api/leaderboard?limit=${limit}&page=${page}`
        : `${BATTLE_SERVICE_URL}/api/leaderboard/mode/${category}?limit=${limit}&page=${page}`;

      const res = await fetch(endpoint, {
        signal: AbortSignal.timeout(3000), // 3s timeout
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data?.entries) && data.data.entries.length > 0) {
          const leaderboard = data.data.entries.map((entry: any) => ({
            rank: entry.rank,
            userId: entry.player_id,
            name: entry.name,
            avatar: entry.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.name)}&background=6366f1&color=fff`,
            arenaPoints: entry.elo,
            arenaRank: entry.rank_tier,
            xp: entry.xp,
            level: entry.level,
            wins: entry.wins,
            losses: entry.losses,
            winRate: entry.win_rate,
            badges: entry.current_streak > 3 ? ['🔥', '🏆'] : ['🏆'],
            totalBattles: entry.total_battles,
            currentStreak: entry.current_streak,
            accuracy: entry.accuracy,
            categoryXP: category !== 'global' ? entry.xp : undefined,
          }));

          return NextResponse.json({
            leaderboard,
            category,
            total: data.data.total || leaderboard.length,
            source: 'battle-service'
          });
        }
      }
    } catch (err: any) {
      // Battle service offline or unavailable — fall through to MongoDB fallback gracefully
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[Arena Leaderboard] Battle service port 8001 unreachable (${err?.code || err?.message || 'offline'}), falling back to MongoDB.`);
      }
    }
  }

  // ── 2. MongoDB Real Registered Users ───────────────────────
  await dbConnect();

  let sortField: Record<string, any> = { arenaPoints: -1, xp: -1 };
  if (category === 'coding')     sortField = { 'gameStats.coding.xp': -1, arenaPoints: -1, xp: -1 };
  if (category === 'puzzle')     sortField = { 'gameStats.puzzle.xp': -1, arenaPoints: -1, xp: -1 };
  if (category === 'math')       sortField = { 'gameStats.math.xp': -1, arenaPoints: -1, xp: -1 };
  if (category === 'gk')         sortField = { 'gameStats.gk.xp': -1, arenaPoints: -1, xp: -1 };
  if (category === 'prediction') sortField = { 'gameStats.prediction.xp': -1, arenaPoints: -1, xp: -1 };
  if (category === 'battle')     sortField = { wins: -1, arenaPoints: -1 };
  if (category === 'xp')         sortField = { xp: -1, arenaPoints: -1 };

  try {
    const users = await User.find({ status: { $ne: 'Blocked' } }, {
      name: 1, email: 1, photoUrl: 1, arenaPoints: 1, arenaRank: 1, xp: 1, level: 1,
      wins: 1, losses: 1, winRate: 1, badges: 1, gameStats: 1, totalBattles: 1,
      currentStreak: 1, accuracy: 1,
    }).sort(sortField).limit(limit);

    const leaderboard = users.map((u: any, i: number) => {
      const arenaPts = Number(u.arenaPoints || 0);
      const categoryScore = category !== 'global' ? Number(u.gameStats?.[category]?.xp ?? u.xp ?? arenaPts) : undefined;
      return {
        rank: i + 1,
        userId: String(u._id),
        name: u.name || 'Anonymous Student',
        email: u.email || '',
        avatar: u.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=6366f1&color=fff`,
        arenaPoints: arenaPts,
        arenaRank: u.arenaRank && u.arenaRank !== 'Unranked' ? u.arenaRank : computeArenaRank(arenaPts),
        xp: Number(u.xp || 0),
        level: Number(u.level || 1),
        wins: Number(u.wins || 0),
        losses: Number(u.losses || 0),
        winRate: Number(u.winRate || 0),
        badges: Array.isArray(u.badges) && u.badges.length > 0 ? u.badges : (u.wins > 5 ? ['🏆', '🔥'] : ['🏆']),
        totalBattles: Number(u.totalBattles || ((u.wins || 0) + (u.losses || 0))),
        currentStreak: Number(u.currentStreak || 0),
        accuracy: Number(u.accuracy || 0),
        categoryXP: categoryScore,
      };
    });

    return NextResponse.json({ leaderboard, category, total: leaderboard.length, source: 'db' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
