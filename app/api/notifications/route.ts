import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getNotificationsForUser, markNotificationRead } from '@/lib/services/notificationService';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    const unread = url.searchParams.get('unread') === 'true';
    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId is required' }, { status: 400 });
    }
    await dbConnect();
    const notifications = await getNotificationsForUser(userId, unread);
    return NextResponse.json({ success: true, notifications }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { notificationId } = await req.json();
    if (!notificationId) {
      return NextResponse.json({ success: false, message: 'notificationId is required' }, { status: 400 });
    }
    await dbConnect();
    const notification = await markNotificationRead(notificationId);
    return NextResponse.json({ success: true, notification }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Failed to mark notification read' }, { status: 500 });
  }
}
