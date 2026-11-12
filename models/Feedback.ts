import mongoose from "mongoose";

export interface IFeedbackReply {
  text: string;
  createdAt: Date;
}

export interface IFeedback extends mongoose.Document {
  userId: string | null;
  userName: string;
  userEmail: string;
  category: "bug" | "feature" | "general" | "praise" | "complaint";
  message: string;
  rating?: number | null;
  status: "new" | "read" | "replied";
  replies: IFeedbackReply[];
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new mongoose.Schema(
  {
    userId: { type: String, default: null },
    userName: { type: String, default: "Anonymous Student" },
    userEmail: { type: String, default: "helpsupport9452@gmail.com" },
    category: {
      type: String,
      enum: ["bug", "feature", "general", "praise", "complaint"],
      default: "general",
    },
    message: { type: String, required: true, maxlength: 2000 },
    rating: { type: Number, min: 1, max: 5, default: null },
    status: { type: String, enum: ["new", "read", "replied"], default: "new" },
    replies: [
      {
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    // Automatically delete the document from MongoDB 24 hours after creation (24 * 3600 = 86400 seconds)
    createdAt: { type: Date, default: Date.now, expires: 86400 },
  },
  { timestamps: true }
);

FeedbackSchema.index({ createdAt: -1 });
FeedbackSchema.index({ status: 1 });

export default (mongoose.models.Feedback as mongoose.Model<IFeedback>) ||
  mongoose.model<IFeedback>("Feedback", FeedbackSchema);
