import mongoose from 'mongoose';

// Follow/Unfollow for user profiles
const FollowerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  followerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  followedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Unique follow per user
FollowerSchema.index({ userId: 1, followerId: 1 }, { unique: true });

export default mongoose.models.Follower || mongoose.model('Follower', FollowerSchema);
