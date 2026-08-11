import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  photoUrl?: string;
  branch?: string;
  bio?: string;
  stream?: StreamType | "";
  course?: string;
  department?: string;
  grade?: string;
  role: "student" | "admin";
  status: "Active" | "Inactive";
  xp: number;
level: number;
points: number;
coins: number;

arenaPoints: number;
arenaRank: string;

wins: number;
losses: number;
draws: number;
totalBattles: number;

winRate: number;

currentStreak: number;
bestStreak: number;

totalCorrect: number;
totalAttempted: number;
accuracy: number;

badges: string[];

gameStats: Record<string, any>;

battleHistory: any[];
}

export type StreamType =
  | "class10"
  | "class11"
  | "class12"
  | "ssc"
  | "upsc"
  | "gate"
  | "jee"
  | "neet"
  | "university"
  | "other";

const UserSchema = new Schema<IUser>(
  {
    // =====================
    // Basic Information
    // =====================
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    phone: { type: String },
    photoUrl: { type: String, default: "" },
    branch: { type: String, default: "" },
    bio: { type: String, default: "" },

    stream: {
      type: String,
      enum: [
        "class10",
        "class11",
        "class12",
        "ssc",
        "upsc",
        "gate",
        "jee",
        "neet",
        "university",
        "other",
        "",
      ],
      default: "",
    },

    course: { type: String, default: "" },
    department: { type: String, default: "" },
    grade: { type: String, default: "" },

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },

    profileComplete: {
      type: Boolean,
      default: false,
    },

    isLabApproved: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

          // =====================
    // Arena Statistics
    // =====================

    xp: {
      type: Number,
      default: 0,
      min: 0,
    },

    level: {
      type: Number,
      default: 1,
      min: 1,
    },

    points: {
      type: Number,
      default: 0,
      min: 0,
    },

    coins: {
      type: Number,
      default: 0,
      min: 0,
    },

    arenaPoints: {
      type: Number,
      default: 1200, // Starting ELO
      min: 0,
      index: true,
    },

    arenaRank: {
      type: String,
      enum: [
        "Unranked",
        "Bronze",
        "Silver",
        "Gold",
        "Platinum",
        "Diamond",
        "Master",
        "Grandmaster",
      ],
      default: "Bronze",
    },

    totalBattles: {
      type: Number,
      default: 0,
      min: 0,
    },

    wins: {
      type: Number,
      default: 0,
      min: 0,
    },

    losses: {
      type: Number,
      default: 0,
      min: 0,
    },

    draws: {
      type: Number,
      default: 0,
      min: 0,
    },

    winRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },

    bestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalCorrect: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAttempted: {
      type: Number,
      default: 0,
      min: 0,
    },

    accuracy: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    badges: {
      type: [String],
      default: [],
    },

    gameStats: {
      type: Schema.Types.Mixed,
      default: {},
    },

    battleHistory: {
      type: [
        {
          battleId: {
            type: String,
            required: true,
          },

          mode: {
            type: String,
            default: "mixed",
          },

          difficulty: {
            type: String,
            default: "beginner",
          },

          result: {
            type: String,
            enum: ["win", "loss", "draw"],
            required: true,
          },

          xpGained: {
            type: Number,
            default: 0,
          },

          pointsGained: {
            type: Number,
            default: 0,
          },

          opponentName: {
            type: String,
            default: "",
          },

          score: {
            type: Number,
            default: 0,
          },

          accuracy: {
            type: Number,
            default: 0,
          },

          timestamp: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    // =====================
    // Arena Approval
    // =====================
    arenaApprovalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    arenaApprovalReason: {
      type: String,
      default: "",
    },

    arenaApprovedBy: {
      type: String,
      default: "",
    },

    arenaApprovedAt: {
      type: Date,
      default: null,
    },

    arenaRejectedAt: {
      type: Date,
      default: null,
    },

    arenaAccessRequestedAt: {
      type: Date,
      default: Date.now,
    },

    // =====================
    // Arena Access
    // =====================
    arenaAccess: {
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },

      approved: {
        type: Boolean,
        default: false,
      },

      approvedAt: {
        type: Date,
        default: null,
      },

      rejectedAt: {
        type: Date,
        default: null,
      },

      requestedAt: {
        type: Date,
        default: Date.now,
      },

      approvedBy: {
        type: String,
        default: "",
      },

      rejectionReason: {
        type: String,
        default: "",
      },
    },
  },
  {
    strict: true,
    timestamps: true,
    versionKey: false,
  }
);

// ---------------------------------------------------------------------------
// Helper: arena rank from arenaPoints (must be defined before the hook)
// ---------------------------------------------------------------------------
function calculateArenaRank(points: number): string {
  if (points >= 5000) return "Grandmaster";
  if (points >= 3000) return "Master";
  if (points >= 2000) return "Diamond";
  if (points >= 1500) return "Platinum";
  if (points >= 1200) return "Gold";
  if (points >= 1000) return "Silver";
  if (points >= 800)  return "Bronze";
  return "Unranked";
}

UserSchema.pre<IUser>("save", function (next) {

  // Automatically calculate win rate
  this.totalBattles = this.wins + this.losses + this.draws;

  this.winRate =
    this.totalBattles > 0
      ? Math.min(100, Number(((this.wins / this.totalBattles) * 100).toFixed(2)))
      : 0;

  // Automatically calculate accuracy
  this.accuracy =
    this.totalAttempted > 0
      ? Number(((this.totalCorrect / this.totalAttempted) * 100).toFixed(2))
      : 0;

  // Automatically update arena rank
  this.arenaRank = calculateArenaRank(this.arenaPoints);

  // Auto approve admin
  if (this.isNew && this.role === "admin") {
    this.arenaApprovalStatus = "approved";
    this.arenaApprovedAt = new Date();

    this.arenaAccess = {
      status: "approved",
      approved: true,
      approvedAt: new Date(),
      rejectedAt: null,
      requestedAt: new Date(),
      approvedBy: "System",
      rejectionReason: "",
    };
  }

  next();
});

// Indexes
UserSchema.index({ email: 1 }, { unique: true });

UserSchema.index({
  arenaPoints: -1,
});

UserSchema.index({
  arenaRank: 1,
});

UserSchema.index({
  wins: -1,
});

UserSchema.index({
  xp: -1,
});

const User =
  mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);

export default User;