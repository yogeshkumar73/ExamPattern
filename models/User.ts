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

UserSchema.pre<IUser>("save", function (next) {
  if (this.isNew && this.role === "admin") {
    this.arenaApprovalStatus = "approved";
    this.arenaApprovedAt = new Date();
    this.arenaAccess.status = "approved";
    this.arenaAccess.approved = true;
    this.arenaAccess.approvedAt = new Date();
    this.arenaAccess.requestedAt = new Date();
  }
  next();
});

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ arenaRank: 1 });

const User =
  mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);

export default User;