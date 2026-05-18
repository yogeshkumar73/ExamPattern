import mongoose from 'mongoose';

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
  password: {
    type: String,
    // Optional for OAuth users
  },
  phone: {
    type: String,
  },
  photoUrl: {
    type: String,
    default: '',
  },
  branch: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
  isLabApproved: {
    type: Boolean,
    default: false, // Requires Admin approval
  },
  points: {
    type: Number,
    default: 0,
  },
  rank: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
    default: 'Bronze',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
