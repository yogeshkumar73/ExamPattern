import mongoose from 'mongoose';

const ChatMessageSchema = new mongoose.Schema({
  roomId: { type: String, required: true }, // 'arena-lobby', 'dm-{userId1}-{userId2}', 'battle-{battleId}'
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  senderAvatar: { type: String, default: '' },
  message: { type: String, required: true },
  type: { type: String, enum: ['dm', 'group', 'battle', 'arena', 'system'], default: 'arena' },
  reactions: [{ emoji: String, userId: String }],
  isSystem: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});

ChatMessageSchema.index({ roomId: 1, timestamp: -1 });
// Auto-expire chat messages after 12 hours (43200 seconds)
ChatMessageSchema.index({ timestamp: 1 }, { expireAfterSeconds: 43200 });

export default mongoose.models.ChatMessage || mongoose.model('ChatMessage', ChatMessageSchema);
