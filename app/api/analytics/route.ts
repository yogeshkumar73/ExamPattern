import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { logAnalyticsEvent, listAnalytics } from '@/lib/services/analyticsService';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId') || undefined;
    await dbConnect();
    const events = await listAnalytics(userId);
    return NextResponse.json({ success: true, events }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Failed to fetch analytics' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId, eventType, payload } = await req.json();
    if (!eventType) {
      return NextResponse.json({ success: false, message: 'eventType is required' }, { status: 400 });
    }
    await dbConnect();
    const event = await logAnalyticsEvent(userId || null, eventType, payload || {});
    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Failed to log analytics event' }, { status: 500 });
  }
}
