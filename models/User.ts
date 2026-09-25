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
  status: "Active" | "Inactive" | "Suspended";
  profileComplete?: boolean;
  isLabApproved?: boolean;
  emailVerified?: boolean;
  customId?: string;
  isOnline?: boolean;
  friends?: string[];
  friendRequests?: string[];
  followers?: string[];
  following?: string[];
  arenaApprovalStatus?: "pending" | "approved" | "rejected" | "suspended";
  arenaApprovalReason?: string;
  arenaApprovedBy?: string;
  arenaApprovedAt?: Date | null;
  arenaRejectedAt?: Date | null;
  arenaAccessRequestedAt?: Date | null;
  arenaAccess?: {
    status: "pending" | "approved" | "rejected" | "suspended";
    approved: boolean;
    approvedAt?: Date | null;
    rejectedAt?: Date | null;
    requestedAt?: Date | null;
    approvedBy?: string;
    rejectionReason?: string;
  };
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
      default: true,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive", "Suspended"],
      default: "Active",
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    customId: {
      type: String,
      default: "",
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    friends: {
      type: [String],
      default: [],
    },

    friendRequests: {
      type: [String],
      default: [],
    },

    followers: {
      type: [String],
      default: [],
    },

    following: {
      type: [String],
      default: [],
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
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "approved",
    },

    arenaApprovalReason: {
      type: String,
      default: "Auto-approved upon registration",
    },

    arenaApprovedBy: {
      type: String,
      default: "System",
    },

    arenaApprovedAt: {
      type: Date,
      default: Date.now,
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
        enum: ["pending", "approved", "rejected", "suspended"],
        default: "approved",
      },

      approved: {
        type: Boolean,
        default: true,
      },

      approvedAt: {
        type: Date,
        default: Date.now,
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
        default: "System",
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

  // Auto approve all new users for battle arena and lab access
  if (this.isNew) {
    if (!this.arenaApprovalStatus || this.arenaApprovalStatus === "pending") {
      this.arenaApprovalStatus = "approved";
      this.arenaApprovedAt = new Date();
      this.arenaApprovedBy = this.role === "admin" ? "Admin" : "System (Auto-Approved)";
      this.arenaApprovalReason = "Auto-approved upon registration";

      this.arenaAccess = {
        status: "approved",
        approved: true,
        approvedAt: new Date(),
        rejectedAt: null,
        requestedAt: new Date(),
        approvedBy: this.role === "admin" ? "Admin" : "System (Auto-Approved)",
        rejectionReason: "",
      };
    }
    if (this.isLabApproved === undefined) {
      this.isLabApproved = true;
    }
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