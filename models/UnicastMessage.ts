import mongoose, { Document, Schema } from 'mongoose';

export interface IUnicastMessage extends Document {
  senderId: string;
  recipientId: string;
  senderName: string;
  senderAvatar: string;
  recipientName: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

const UnicastMessageSchema = new Schema<IUnicastMessage>(
  {
    senderId: {
      type: String,
      required: true,
      index: true,
    },
    recipientId: {
      type: String,
      required: true,
      index: true,
    },
    senderName: {
      type: String,
      default: 'Student',
    },
    senderAvatar: {
      type: String,
      default: '',
    },
    recipientName: {
      type: String,
      default: 'Friend',
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

// Fast compound lookup index for 1-on-1 conversation threads
UnicastMessageSchema.index({ senderId: 1, recipientId: 1, createdAt: -1 });
UnicastMessageSchema.index({ recipientId: 1, senderId: 1, createdAt: -1 });

// TTL Index: Auto-delete chat messages after exactly 1 day (24 hours = 86400 seconds)
UnicastMessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export default mongoose.models.UnicastMessage ||
  mongoose.model<IUnicastMessage>('UnicastMessage', UnicastMessageSchema);
