import mongoose from 'mongoose';

const TournamentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mode: { type: String, enum: ['coding', 'puzzle', 'math', 'gk', 'prediction', 'color', 'custom', 'mixed'], required: true },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert', 'master', 'grandmaster'], default: 'intermediate' },
  status: { type: String, enum: ['open', 'active', 'finished'], default: 'open' },
  maxParticipants: { type: Number, default: 8 },
  matchDuration: { type: Number, default: 300 },
  expiryHours: { type: Number, default: 24 },
  expiresAt: { type: Date, default: null },
  questionsPerMatch: { type: Number, default: 10 },
  rules: {
    timePerQuestion: { type: Number, default: 30 },
    pointsPerCorrect: { type: Number, default: 100 },
    penaltyPerWrong: { type: Number, default: 0 },
    allowBots: { type: Boolean, default: true },
    customRules: { type: String, default: '' },
  },
  participants: [{
    userId: String,
    name: String,
    avatar: String,
    seed: Number,
    eliminated: { type: Boolean, default: false },
    score: { type: Number, default: 0 },
    place: { type: Number, default: null },
  }],
  bracket: [{
    round: Number,
    match: Number,
    player1Id: String,
    player1Name: String,
    player1Score: { type: Number, default: 0 },
    player2Id: String,
    player2Name: String,
    player2Score: { type: Number, default: 0 },
    winnerId: String,
    battleId: String,
    status: { type: String, enum: ['pending', 'active', 'done'], default: 'pending' },
    startTime: { type: Date, default: null },
    endTime: { type: Date, default: null },
  }],
  rankings: [{
    rank: Number,
    userId: String,
    userName: String,
    userAvatar: String,
    finalScore: Number,
    place: Number,
  }],
  currentRound: { type: Number, default: 1 },
  winnerId: { type: String, default: null },
  winnerName: { type: String, default: null },
  prizeXP: { type: Number, default: 1000 },
  prizePool: { type: Number, default: 1000 },
  startTime: { type: Date },
  scheduledStartTime: { type: Date, default: null },
  endTime: { type: Date },
  createdBy: { type: String },
  hostName: { type: String, default: '' },
  password: { type: String, default: '' },
  inviteCode: { type: String, default: '' },
  isPrivate: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  isDestroyed: { type: Boolean, default: false },
  destroyedAt: { type: Date, default: null },
});

if (mongoose.models && mongoose.models.Tournament) {
  delete (mongoose.models as any).Tournament;
}

export default mongoose.model('Tournament', TournamentSchema);
