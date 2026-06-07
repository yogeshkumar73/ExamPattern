import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

const ACHIEVEMENTS_CATALOG = [
  { id: 'first_win', name: 'First Blood', description: 'Win your first battle', icon: '⚔️', condition: (u: any) => u.wins >= 1, xpReward: 100, coinsReward: 50 },
  { id: 'win_10', name: 'Battle Hardened', description: 'Win 10 battles', icon: '🏆', condition: (u: any) => u.wins >= 10, xpReward: 500, coinsReward: 200 },
  { id: 'win_50', name: 'Arena Champion', description: 'Win 50 battles', icon: '👑', condition: (u: any) => u.wins >= 50, xpReward: 2000, coinsReward: 1000 },
  { id: 'coding_10', name: 'Coding Champion', description: 'Win 10 coding battles', icon: '💻', condition: (u: any) => u.gameStats?.coding?.wins >= 10, xpReward: 500, coinsReward: 200 },
  { id: 'math_10', name: 'Math Wizard', description: 'Win 10 math battles', icon: '🔢', condition: (u: any) => u.gameStats?.math?.wins >= 10, xpReward: 500, coinsReward: 200 },
  { id: 'puzzle_10', name: 'Puzzle Master', description: 'Win 10 puzzle battles', icon: '🧩', condition: (u: any) => u.gameStats?.puzzle?.wins >= 10, xpReward: 500, coinsReward: 200 },
  { id: 'gk_10', name: 'GK Genius', description: 'Win 10 GK battles', icon: '🌍', condition: (u: any) => u.gameStats?.gk?.wins >= 10, xpReward: 500, coinsReward: 200 },
  { id: 'prediction_10', name: 'Prediction Expert', description: 'Win 10 prediction battles', icon: '🔮', condition: (u: any) => u.gameStats?.prediction?.wins >= 10, xpReward: 500, coinsReward: 200 },
  { id: 'streak_5', name: 'On Fire!', description: 'Win 5 battles in a row', icon: '🔥', condition: (u: any) => u.currentStreak >= 5, xpReward: 300, coinsReward: 150 },
  { id: 'streak_10', name: 'Unstoppable', description: 'Win 10 battles in a row', icon: '⚡', condition: (u: any) => u.currentStreak >= 10, xpReward: 1000, coinsReward: 500 },
  { id: 'xp_1000', name: 'XP Hunter', description: 'Earn 1000 XP', icon: '✨', condition: (u: any) => u.xp >= 1000, xpReward: 100, coinsReward: 50 },
  { id: 'xp_5000', name: 'Smart Lab Legend', description: 'Earn 5000 XP', icon: '🌟', condition: (u: any) => u.xp >= 5000, xpReward: 2000, coinsReward: 1000 },
  { id: 'accuracy_90', name: 'Sharp Shooter', description: 'Maintain 90%+ accuracy', icon: '🎯', condition: (u: any) => u.accuracy >= 90, xpReward: 500, coinsReward: 200 },
  { id: 'battles_100', name: 'Veteran', description: 'Play 100 battles', icon: '🛡️', condition: (u: any) => u.totalBattles >= 100, xpReward: 1000, coinsReward: 500 },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ achievements: ACHIEVEMENTS_CATALOG.map(a => ({ ...a, condition: undefined })) });
  }

  await dbConnect();
  try {
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const userAchievementIds = (user.achievements || []).map((a: any) => a.id);
    
    const result = ACHIEVEMENTS_CATALOG.map(ach => ({
      id: ach.id,
      name: ach.name,
      description: ach.description,
      icon: ach.icon,
      xpReward: ach.xpReward,
      coinsReward: ach.coinsReward,
      unlocked: userAchievementIds.includes(ach.id),
      eligible: ach.condition(user),
    }));

    return NextResponse.json({ achievements: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  try {
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const userAchievementIds = (user.achievements || []).map((a: any) => a.id);
    const newlyUnlocked: any[] = [];

    for (const ach of ACHIEVEMENTS_CATALOG) {
      if (!userAchievementIds.includes(ach.id) && ach.condition(user)) {
        user.achievements.push({
          id: ach.id, name: ach.name, description: ach.description,
          icon: ach.icon, unlockedAt: new Date(), xpReward: ach.xpReward,
        });
        user.xp = (user.xp || 0) + ach.xpReward;
        user.coins = (user.coins || 0) + ach.coinsReward;
        user.badges.push(ach.icon);
        newlyUnlocked.push(ach);
      }
    }

    if (newlyUnlocked.length > 0) await user.save();
    return NextResponse.json({ newlyUnlocked, total: user.achievements.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
