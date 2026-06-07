import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getLeaderboard } from '@/lib/services/leaderboardService';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get('type') || 'Global';
    const scope = url.searchParams.get('scope') || '';
    const language = url.searchParams.get('language') || undefined;
    await dbConnect();
    const board = await getLeaderboard(type, scope, language);
    return NextResponse.json({ success: true, leaderboard: board }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
