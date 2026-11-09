import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import {
  createNotification,
  getNotificationsForUser,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  getRecipientsList,
} from '@/lib/services/notificationService';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    const email = url.searchParams.get('email');
    const action = url.searchParams.get('action');
    const unread = url.searchParams.get('unread') === 'true';

    await dbConnect();

    // If requested, return available recipients (students) to message
    if (action === 'recipients') {
      const currentUserId = userId || undefined;
      const recipients = await getRecipientsList(currentUserId);
      return NextResponse.json({ success: true, recipients }, { status: 200 });
    }

    const identifier = userId || email;
    if (!identifier) {
      return NextResponse.json({ success: false, message: 'userId or email is required' }, { status: 400 });
    }

    const notifications = await getNotificationsForUser(identifier, unread);
    const unreadCount = notifications.filter((n: any) => !n.isRead).length;

    return NextResponse.json(
      {
        success: true,
        notifications,
        unreadCount,
        total: notifications.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/notifications error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      recipientId,
      recipientEmail,
      recipientName,
      senderId,
      senderName,
      senderPhotoUrl,
      senderEmail,
      title,
      message,
      category = 'direct_message',
      priority = 'normal',
      actionUrl = '',
    } = body;

    if (!title || !message) {
      return NextResponse.json(
        { success: false, message: 'Title and message are required fields.' },
        { status: 400 }
      );
    }

    const targetUserId = recipientId || recipientEmail || 'all';

    await dbConnect();

    // Securely resolve recipient details on server if ID provided (prevents leaking emails to client)
    let finalRecipientEmail = recipientEmail || '';
    let finalRecipientName = recipientName || '';
    if (recipientId && recipientId !== 'all') {
      try {
        const target = await User.findById(recipientId);
        if (target) {
          finalRecipientEmail = target.email || '';
          finalRecipientName = target.name || '';
        }
      } catch (_) {}
    }

    const notification = await createNotification({
      userId: targetUserId,
      recipientEmail: finalRecipientEmail,
      recipientName: finalRecipientName,
      senderId: senderId || 'user',
      senderName: senderName || 'Fellow Student',
      senderPhotoUrl: senderPhotoUrl || '',
      senderEmail: senderEmail || '',
      title,
      message,
      category,
      priority,
      actionUrl,
    });

    if (!notification) {
      return NextResponse.json(
        { success: false, message: 'Failed to create notification.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Notification sent successfully.',
        notification,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/notifications error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to send notification' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { notificationId, markAll, userId, email } = body;

    await dbConnect();

    if (markAll) {
      const identifier = userId || email;
      if (!identifier) {
        return NextResponse.json({ success: false, message: 'userId or email is required to mark all as read' }, { status: 400 });
      }
      await markAllNotificationsRead(identifier);
      return NextResponse.json({ success: true, message: 'All notifications marked as read' }, { status: 200 });
    }

    if (!notificationId) {
      return NextResponse.json({ success: false, message: 'notificationId is required' }, { status: 400 });
    }

    const notification = await markNotificationRead(notificationId);
    return NextResponse.json({ success: true, notification }, { status: 200 });
  } catch (error: any) {
    console.error('PUT /api/notifications error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to update notification' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const notificationId = url.searchParams.get('notificationId');

    if (!notificationId) {
      return NextResponse.json({ success: false, message: 'notificationId is required' }, { status: 400 });
    }

    await dbConnect();
    await deleteNotification(notificationId);
    return NextResponse.json({ success: true, message: 'Notification deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('DELETE /api/notifications error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to delete notification' }, { status: 500 });
  }
}
