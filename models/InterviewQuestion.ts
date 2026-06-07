import mongoose from 'mongoose';

const InterviewQuestionSchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  answer: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.InterviewQuestion || mongoose.model('InterviewQuestion', InterviewQuestionSchema);
