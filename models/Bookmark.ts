import mongoose from 'mongoose';

// Bookmark for users to save papers
const BookmarkSchema = new mongoose.Schema({
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
  bookmarkedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Unique bookmark per user per paper
BookmarkSchema.index({ paperId: 1, userId: 1 }, { unique: true });

export default mongoose.models.Bookmark || mongoose.model('Bookmark', BookmarkSchema);
