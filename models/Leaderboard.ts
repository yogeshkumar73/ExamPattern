import mongoose from 'mongoose';

const LeaderboardSchema = new mongoose.Schema({
  type: { type: String, enum: ['Global', 'Weekly', 'Monthly'], default: 'Global' },
  entries: [{ userId: mongoose.Schema.Types.ObjectId, username: String, points: Number, rank: String }],
  refreshedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Leaderboard || mongoose.model('Leaderboard', LeaderboardSchema);
