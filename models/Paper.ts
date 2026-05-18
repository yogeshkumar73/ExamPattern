import mongoose from 'mongoose';

const PaperSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a paper title'],
  },
  branch: {
    type: String,
    required: [true, 'Please provide a branch/category'],
  },
  year: {
    type: String,
    required: [true, 'Please provide the year of the paper'],
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  fileUrl: {
    type: String,
    required: [true, 'Please provide the file URL or text content'],
  },
  downloads: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Paper || mongoose.model('Paper', PaperSchema);
