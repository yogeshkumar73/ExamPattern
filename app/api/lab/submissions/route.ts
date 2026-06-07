import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getSubmissionHistory } from '@/lib/services/labService';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId is required' }, { status: 400 });
    }
    await dbConnect();
    const submissions = await getSubmissionHistory(userId);
    return NextResponse.json({ success: true, submissions }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Failed to load submissions' }, { status: 500 });
  }
}
