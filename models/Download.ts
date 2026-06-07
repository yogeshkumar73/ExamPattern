import mongoose from 'mongoose';

// Download record for tracking who downloaded what
const DownloadSchema = new mongoose.Schema({
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
  downloadedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Create compound index to prevent duplicate records
DownloadSchema.index({ paperId: 1, userId: 1, downloadedAt: -1 });

export default mongoose.models.Download || mongoose.model('Download', DownloadSchema);
