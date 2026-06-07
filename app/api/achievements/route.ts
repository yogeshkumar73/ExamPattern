import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAchievementsForUser } from '@/lib/services/achievementService';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId is required' }, { status: 400 });
    }
    await dbConnect();
    const achievements = await getAchievementsForUser(userId);
    return NextResponse.json({ success: true, achievements }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Failed to fetch achievements' }, { status: 500 });
  }
}
