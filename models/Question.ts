import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  description: { type: String, required: true },
  category: { type: String, default: 'General' },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
  supportedLanguages: { type: [String], default: ['JavaScript', 'Python', 'Java'] },
  sampleInput: { type: String, default: '' },
  sampleOutput: { type: String, default: '' },
  stats: { solves: { type: Number, default: 0 }, attempts: { type: Number, default: 0 }, successRate: { type: Number, default: 0 } },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Question || mongoose.model('Question', QuestionSchema);
