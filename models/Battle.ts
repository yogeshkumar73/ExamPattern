import mongoose from 'mongoose';

const BattleSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  type: { type: String, enum: ['1v1', 'team', 'ranked', 'private', 'tournament'], default: '1v1' },
  mode: { type: String, enum: ['coding', 'puzzle', 'math', 'gk', 'prediction', 'mixed'], required: true },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert', 'master', 'grandmaster'], default: 'beginner' },
  status: { type: String, enum: ['waiting', 'active', 'finished', 'cancelled'], default: 'waiting' },
  participants: [{
    userId: String,
    name: String,
    avatar: String,
    score: { type: Number, default: 0 },
    xpGained: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    totalAnswers: { type: Number, default: 0 },
    speed: { type: Number, default: 0 },
    finished: { type: Boolean, default: false },
  }],
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ArenaQuestion' }],
  winnerId: { type: String, default: null },
  startTime: { type: Date },
  endTime: { type: Date },
  duration: { type: Number, default: 300 }, // seconds
  tournamentId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Battle || mongoose.model('Battle', BattleSchema);
