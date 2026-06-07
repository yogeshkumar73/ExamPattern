import mongoose from 'mongoose';

const MockInterviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'InterviewQuestion' }],
  answers: { type: [String], default: [] },
  score: { type: Number, default: 0 },
  readinessScore: { type: Number, default: 0 },
  status: { type: String, enum: ['Running', 'Completed'], default: 'Running' },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

export default mongoose.models.MockInterview || mongoose.model('MockInterview', MockInterviewSchema);
