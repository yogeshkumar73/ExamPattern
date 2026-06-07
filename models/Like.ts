import mongoose from 'mongoose';

// Like for papers
const LikeSchema = new mongoose.Schema({
  paperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paper',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  likedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Unique like per user per paper
LikeSchema.index({ paperId: 1, userId: 1 }, { unique: true });
LikeSchema.index({ paperId: 1, likedAt: -1 });

export default mongoose.models.Like || mongoose.model('Like', LikeSchema);
