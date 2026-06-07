import Notification from '@/models/Notification';

export async function createNotification(userId: string, title: string, message: string, category = 'General', data = {}) {
  try {
    return await Notification.create({ userId, title, message, category, data });
  } catch (error) {
    return null;
  }
}

export async function getNotificationsForUser(userId: string, unreadOnly = false) {
  try {
    const query: any = { userId };
    if (unreadOnly) query.isRead = false;
    return Notification.find(query).sort({ createdAt: -1 }).lean();
  } catch (error) {
    return [];
  }
}

export async function markNotificationRead(notificationId: string) {
  try {
    return Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
  } catch (error) {
    return null;
  }
}
