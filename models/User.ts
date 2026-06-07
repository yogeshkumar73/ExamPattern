import mongoose from 'mongoose';

export type StreamType =
  | 'class10'
  | 'class11'
  | 'class12'
  | 'ssc'
  | 'upsc'
  | 'gate'
  | 'jee'
  | 'neet'
  | 'university'
  | 'other';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
  },
  password: { type: String },
  phone: { type: String },
  photoUrl: { type: String, default: '' },
  branch: { type: String, default: '' },
  bio: { type: String, default: '' },
  stream: {
    type: String,
    enum: ['class10', 'class11', 'class12', 'ssc', 'upsc', 'gate', 'jee', 'neet', 'university', 'other', ''],
    default: '',
  },
  course: { type: String, default: '' },
  department: { type: String, default: '' },
  grade: { type: String, default: '' },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  profileComplete: { type: Boolean, default: false },
  isLabApproved: { type: Boolean, default: false },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },

  // === Arena Approval System ===
  arenaApprovalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  arenaApprovalReason: { type: String, default: '' },
  arenaApprovedBy: { type: String, default: '' },
  arenaApprovedAt: { type: Date, default: null },
  arenaRejectedAt: { type: Date, default: null },
  arenaAccessRequestedAt: { type: Date, default: Date.now },

  // === Legacy Points/Rank ===
  points: { type: Number, default: 0 },
  rank: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], default: 'Bronze' },

  // === Arena XP & Level System ===
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  coins: { type: Number, default: 0 },
  arenaPoints: { type: Number, default: 0 },
  arenaRank: {
    type: String,
    enum: ['Unranked', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster'],
    default: 'Unranked',
  },

  // === Battle Stats ===
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  draws: { type: Number, default: 0 },
  totalBattles: { type: Number, default: 0 },
  winRate: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  bestStreak: { type: Number, default: 0 },

  // === Per-Category Stats ===
  gameStats: {
    coding:     { wins: { type: Number, default: 0 }, losses: { type: Number, default: 0 }, xp: { type: Number, default: 0 } },
    puzzle:     { wins: { type: Number, default: 0 }, losses: { type: Number, default: 0 }, xp: { type: Number, default: 0 } },
    math:       { wins: { type: Number, default: 0 }, losses: { type: Number, default: 0 }, xp: { type: Number, default: 0 } },
    gk:         { wins: { type: Number, default: 0 }, losses: { type: Number, default: 0 }, xp: { type: Number, default: 0 } },
    prediction: { wins: { type: Number, default: 0 }, losses: { type: Number, default: 0 }, xp: { type: Number, default: 0 } },
    mixed:      { wins: { type: Number, default: 0 }, losses: { type: Number, default: 0 }, xp: { type: Number, default: 0 } },
  },

  // === Battle History ===
  battleHistory: [{
    battleId: String,
    mode: String,
    difficulty: String,
    result: { type: String, enum: ['win', 'loss', 'draw'] },
    xpGained: Number,
    pointsGained: Number,
    opponentName: String,
    score: Number,
    accuracy: Number,
    timestamp: { type: Date, default: Date.now },
  }],

  // === Social ===
  followers: [{ type: String }],
  following: [{ type: String }],
  friends: [{ type: String }],
  friendRequests: [{ type: String }],
  blockedUsers: [{ type: String }],

  // === Achievements & Badges ===
  badges: [{ type: String }],
  achievements: [{
    id: String,
    name: String,
    description: String,
    icon: String,
    unlockedAt: Date,
    xpReward: Number,
  }],

  // === Accuracy Tracking ===
  totalCorrect: { type: Number, default: 0 },
  totalAttempted: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },

  // === Online Status ===
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
