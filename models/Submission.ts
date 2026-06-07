import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  language: { type: String, required: true },
  code: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Passed', 'Failed'], default: 'Pending' },
  score: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);
