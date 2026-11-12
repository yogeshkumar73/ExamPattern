import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // recipient user ID, email, or 'all'
    recipientEmail: { type: String, default: '' },
    recipientName: { type: String, default: '' },
    senderId: { type: String, default: 'system' },
    senderName: { type: String, default: 'Aura System' },
    senderPhotoUrl: { type: String, default: '' },
    senderEmail: { type: String, default: '' },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    category: {
      type: String,
      default: 'message',
      enum: ['message', 'direct_message', 'study_invite', 'battle_challenge', 'achievement', 'General', 'system'],
    },
    priority: {
      type: String,
      default: 'normal',
      enum: ['low', 'normal', 'high', 'urgent'],
    },
    actionUrl: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now, expires: 43200 }, // Auto delete after 12 hours (12 * 3600 = 43200)
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ recipientEmail: 1, isRead: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
