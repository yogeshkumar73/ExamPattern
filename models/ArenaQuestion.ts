import mongoose from 'mongoose';

const ArenaQuestionSchema = new mongoose.Schema({
  category: { type: String, enum: ['coding', 'puzzle', 'math', 'gk', 'prediction', 'mixed'], required: true },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert', 'master', 'grandmaster'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  // For MCQ (math, gk, puzzle, prediction)
  options: [String],
  correctAnswer: { type: String },
  // For coding
  boilerplate: { type: String, default: '' },
  testCases: [{ input: String, expectedOutput: String }],
  // For prediction
  sequence: [Number],
  targetValue: Number,
  // Metadata
  timeLimit: { type: Number, default: 60 }, // seconds
  xpReward: { type: Number, default: 50 },
  pointsReward: { type: Number, default: 100 },
  tags: [String],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.ArenaQuestion || mongoose.model('ArenaQuestion', ArenaQuestionSchema);
