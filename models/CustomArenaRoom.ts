import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomQuestion {
  id: string;
  question: string;
  type: 'mcq' | 'written';
  options?: string[];
  correctIndex?: number;
  modelAnswer?: string;
  keywords?: string[];
  explanation?: string;
  points?: number;
}

export interface ICustomParticipant {
  userId: string;
  name: string;
  avatar: string;
  team?: 'Team Alpha' | 'Team Beta' | 'Solo';
  score: number;
  answers: Array<{
    questionId: string;
    studentAnswer: string | number;
    isCorrect: boolean;
    score: number;
    similarity?: number;
    feedback?: string;
  }>;
  accuracy: number;
  speedSeconds: number;
  finished: boolean;
  joinedAt: Date;
}

export interface ICustomArenaRoom extends Document {
  roomId: string;
  roomCode: string;
  password?: string;
  isPrivate: boolean;
  title: string;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  matchType: '1v1' | 'team' | 'open';
  examFormat: 'mcqs' | 'written' | 'mixed';
  documentSource: 'pdf' | 'text' | 'syllabus';
  documentName: string;
  documentContent: string;
  maxPlayers: number;
  questionCount: number;
  timeLimitSeconds: number;
  expiresAt: Date;
  status: 'waiting' | 'playing' | 'completed' | 'expired';
  questions: ICustomQuestion[];
  participants: ICustomParticipant[];
  teamScores: Record<string, number>;
  winnerTeam?: string;
  winnerUser?: {
    userId: string;
    name: string;
    score: number;
  };
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

const CustomArenaRoomSchema = new Schema<ICustomArenaRoom>({
  roomId: { type: String, required: true, unique: true, index: true },
  roomCode: { type: String, required: true, index: true },
  password: { type: String, default: '' },
  isPrivate: { type: Boolean, default: false },
  title: { type: String, required: true, default: 'Custom Study Clash' },
  hostId: { type: String, required: true },
  hostName: { type: String, required: true },
  hostAvatar: { type: String, default: '' },
  matchType: { type: String, enum: ['1v1', 'team', 'open'], default: 'open' },
  examFormat: { type: String, enum: ['mcqs', 'written', 'mixed'], default: 'mcqs' },
  documentSource: { type: String, enum: ['pdf', 'text', 'syllabus'], default: 'text' },
  documentName: { type: String, default: 'Study Material' },
  documentContent: { type: String, default: '' },
  maxPlayers: { type: Number, default: 4 },
  questionCount: { type: Number, default: 5 },
  timeLimitSeconds: { type: Number, default: 300 },
  expiresAt: { type: Date },
  status: { type: String, enum: ['waiting', 'playing', 'completed', 'expired'], default: 'waiting' },
  questions: [{
    id: String,
    question: String,
    type: { type: String, enum: ['mcq', 'written'], default: 'mcq' },
    options: [String],
    correctIndex: Number,
    modelAnswer: String,
    keywords: [String],
    explanation: String,
    points: { type: Number, default: 10 },
  }],
  participants: [{
    userId: String,
    name: String,
    avatar: String,
    team: { type: String, default: 'Team Alpha' },
    score: { type: Number, default: 0 },
    answers: [{
      questionId: String,
      studentAnswer: Schema.Types.Mixed,
      isCorrect: Boolean,
      score: Number,
      similarity: Number,
      feedback: String,
    }],
    accuracy: { type: Number, default: 0 },
    speedSeconds: { type: Number, default: 0 },
    finished: { type: Boolean, default: false },
    joinedAt: { type: Date, default: Date.now },
  }],
  teamScores: { type: Map, of: Number, default: {} },
  winnerTeam: { type: String, default: null },
  winnerUser: {
    userId: String,
    name: String,
    score: Number,
  },
  createdAt: { type: Date, default: Date.now },
  startedAt: { type: Date },
  completedAt: { type: Date },
});

if (mongoose.models && mongoose.models.CustomArenaRoom) {
  delete (mongoose.models as any).CustomArenaRoom;
}

export default mongoose.model<ICustomArenaRoom>('CustomArenaRoom', CustomArenaRoomSchema);
