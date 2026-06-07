import User from '@/models/User';
import Submission from '@/models/Submission';

export async function unlockAchievementsForUser(userId: string) {
  const user = await User.findById(userId);
  if (!user) return [];
  return [];
}

export async function getAchievementsForUser(userId: string) {
  const user = await User.findById(userId).populate('achievements');
  return user?.achievements || [];
}
