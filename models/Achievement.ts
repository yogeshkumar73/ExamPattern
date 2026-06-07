import mongoose from 'mongoose';

const AchievementSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  description: { type: String, default: '' },
  icon: { type: String, default: '' },
  unlockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Achievement || mongoose.model('Achievement', AchievementSchema);
