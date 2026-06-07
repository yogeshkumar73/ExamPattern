import mongoose from 'mongoose';

// Report for inappropriate/spam papers
const ReportSchema = new mongoose.Schema({
  paperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paper',
    required: true,
    index: true,
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  reason: {
    type: String,
    enum: ['Inappropriate', 'Spam', 'Copyright', 'Offensive', 'Other'],
    required: true,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'action_taken', 'dismissed'],
    default: 'pending',
    index: true,
  },
  reportedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  reviewedBy: mongoose.Schema.Types.ObjectId,
  reviewedAt: Date,
});

// Prevent duplicate reports
ReportSchema.index({ paperId: 1, reportedBy: 1 }, { unique: true });

export default mongoose.models.Report || mongoose.model('Report', ReportSchema);
