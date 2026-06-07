import AnalyticsEvent from '@/models/AnalyticsEvent';

export async function logAnalyticsEvent(userId: string | null, eventType: string, payload: Record<string, any> = {}) {
  try {
    return AnalyticsEvent.create({ userId, eventType, payload });
  } catch (error) {
    return null;
  }
}

export async function listAnalytics(userId?: string) {
  try {
    const query: any = {};
    if (userId) query.userId = userId;
    return AnalyticsEvent.find(query).sort({ createdAt: -1 }).limit(200).lean();
  } catch (error) {
    return [];
  }
}
