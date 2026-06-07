import User from '@/models/User';
import Leaderboard from '@/models/Leaderboard';

export async function getLeaderboard(type = 'Global', scope = '', language?: string) {
  try {
    const board = await Leaderboard.findOne({ type, scope }).lean();
    if (board) return board;
    const users = await User.find({}).sort({ xp: -1 }).limit(100).lean();
    const entries = users.map((user) => ({
      userId: user._id,
      username: user.name,
      points: user.xp ?? 0,
      rank: user.rank || 'Bronze',
      score: user.weeklyScore || 0,
      language: language || '',
    }));
    return { type, scope, entries, refreshedAt: new Date() };
  } catch (error) {
    return { type, scope, entries: [], refreshedAt: new Date() };
  }
}
