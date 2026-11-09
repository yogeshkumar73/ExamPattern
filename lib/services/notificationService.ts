import Notification from '@/models/Notification';
import User from '@/models/User';

export interface CreateNotificationParams {
  userId: string;
  recipientEmail?: string;
  recipientName?: string;
  senderId?: string;
  senderName?: string;
  senderPhotoUrl?: string;
  senderEmail?: string;
  title: string;
  message: string;
  category?: 'message' | 'direct_message' | 'study_invite' | 'battle_challenge' | 'achievement' | 'General' | 'system';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  actionUrl?: string;
}

export async function createNotification(params: CreateNotificationParams | any, oldTitle?: string, oldMessage?: string, oldCategory = 'General') {
  try {
    // Backwards-compatibility with legacy 4-arg signature (userId, title, message, category)
    if (typeof params === 'string') {
      return await Notification.create({
        userId: params,
        title: oldTitle || 'Notification',
        message: oldMessage || '',
        category: oldCategory || 'General',
      });
    }

    const {
      userId,
      recipientEmail = '',
      recipientName = '',
      senderId = 'system',
      senderName = 'Aura System',
      senderPhotoUrl = '',
      senderEmail = '',
      title,
      message,
      category = 'message',
      priority = 'normal',
      actionUrl = '',
    } = params;

    return await Notification.create({
      userId,
      recipientEmail,
      recipientName,
      senderId,
      senderName,
      senderPhotoUrl,
      senderEmail,
      title,
      message,
      category,
      priority,
      actionUrl,
    });
  } catch (error) {
    console.error('createNotification error:', error);
    return null;
  }
}

export async function getNotificationsForUser(identifier: string, unreadOnly = false) {
  try {
    const query: any = {
      $or: [
        { userId: identifier },
        { recipientEmail: identifier },
        { userId: 'all' },
      ],
    };

    if (unreadOnly) {
      query.isRead = false;
    }

    return await Notification.find(query).sort({ createdAt: -1 }).limit(100).lean();
  } catch (error) {
    console.error('getNotificationsForUser error:', error);
    return [];
  }
}

export async function markNotificationRead(notificationId: string) {
  try {
    return await Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
  } catch (error) {
    console.error('markNotificationRead error:', error);
    return null;
  }
}

export async function markAllNotificationsRead(identifier: string) {
  try {
    return await Notification.updateMany(
      {
        $or: [
          { userId: identifier },
          { recipientEmail: identifier },
          { userId: 'all' },
        ],
        isRead: false,
      },
      { $set: { isRead: true } }
    );
  } catch (error) {
    console.error('markAllNotificationsRead error:', error);
    return null;
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    return await Notification.findByIdAndDelete(notificationId);
  } catch (error) {
    console.error('deleteNotification error:', error);
    return null;
  }
}

export async function getRecipientsList(currentUserId?: string) {
  try {
    const query: any = {};
    if (currentUserId) {
      query._id = { $ne: currentUserId };
    }
    const users = await User.find(query, {
      name: 1,
      photoUrl: 1,
      stream: 1,
      rank: 1,
      arenaRank: 1,
      level: 1,
    })
      .limit(50)
      .lean();

    // Map to secure short form ID and never expose real gmail addresses
    return users.map((u: any) => ({
      _id: u._id.toString(),
      name: u.name || 'Student',
      shortId: `#${u._id.toString().slice(-6).toUpperCase()}`,
      photoUrl: u.photoUrl || '',
      stream: u.stream || '',
      rank: u.rank || 'Bronze',
      arenaRank: u.arenaRank || 'Unranked',
      level: u.level || 1,
    }));
  } catch (error) {
    console.error('getRecipientsList error:', error);
    return [];
  }
}
