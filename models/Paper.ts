import mongoose from 'mongoose';

export type SectionType =
  | 'SSC'
  | 'UPSC'
  | 'CBSE'
  | 'GATE'
  | 'JEE'
  | 'NEET'
  | 'University'
  | 'Board'
  | 'Custom'
  | 'Other';

const PaperSchema = new mongoose.Schema(
  {
    // Unique paper identifier
    paperId: {
      type: String,
      unique: true,
      index: true,
    },

    // Basic information
    title: {
      type: String,
      required: [true, 'Please provide a paper title'],
      index: true,
    },
    description: {
      type: String,
      default: '',
    },

    // Exam/Course information
    examType: {
      type: String,
      enum: ['JEE', 'NEET', 'UPSC', 'GATE', 'SSC', 'CBSE', 'Board', 'University', 'Other'],
      index: true,
    },
    subject: {
      type: String,
      index: true,
    },
    year: {
      type: Number,
      index: true,
    },

    // Legacy fields (kept for backward compatibility)
    stream: {
      type: String,
      enum: ['class10', 'class11', 'class12', 'ssc', 'upsc', 'gate', 'jee', 'neet', 'university', 'other'],
    },
    section: {
      type: String,
      enum: ['SSC', 'UPSC', 'CBSE', 'GATE', 'JEE', 'NEET', 'University', 'Board', 'Custom', 'Other'],
    },
    branch: {
      type: String,
      default: '',
    },

    // File information (GridFS)
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    fileHash: {
      type: String,
      unique: true,
      sparse: true,
      index: true, // For duplicate detection
    },
    gridfsId: mongoose.Schema.Types.ObjectId, // GridFS file ID

    // Legacy base64 field (can be removed after migration)
    fileData: {
      type: String,
      default: '',
    },

    // Uploader information
    uploaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    uploaderName: {
      type: String,
      required: true,
    },
    uploaderAvatar: {
      type: String,
      default: '',
    },

    // Engagement metrics
    downloads: {
      type: Number,
      default: 0,
      index: true,
    },
    likes: {
      type: Number,
      default: 0,
      index: true,
    },
    bookmarks: {
      type: Number,
      default: 0,
    },
    reports: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },

    // Status and moderation
    isApproved: {
      type: Boolean,
      default: true,
    },
    isReported: {
      type: Boolean,
      default: false,
      index: true,
    },
    isBanned: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Text indexes for search functionality
PaperSchema.index({ title: 'text', description: 'text', subject: 'text' });

// Indexes for filtering and sorting
PaperSchema.index({ examType: 1, year: -1 });
PaperSchema.index({ subject: 1, year: -1 });
PaperSchema.index({ downloadAt: -1 });
PaperSchema.index({ createdAt: -1 });

export default mongoose.models.Paper || mongoose.model('Paper', PaperSchema);
