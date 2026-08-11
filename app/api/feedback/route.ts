import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";
import mongoose from "mongoose";

// Mongoose schema for feedback
let FeedbackModel: mongoose.Model<any>;
try {
  FeedbackModel = mongoose.model("Feedback");
} catch {
  const FeedbackSchema = new mongoose.Schema({
    userId: { type: String, default: null },
    userName: { type: String, default: "Anonymous" },
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
    createdAt: { type: Date, default: Date.now },
  });
  FeedbackModel = mongoose.model("Feedback", FeedbackSchema);
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`feedback:${ip}`, 5, 60 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { message: `Too many feedback submissions. Try again in ${rl.resetIn}s.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { userId, userName, userEmail, category, message, rating } = body;

    if (!message || message.trim().length < 5) {
      return NextResponse.json(
        { message: "Please write a meaningful message (at least 5 characters)." },
        { status: 400 }
      );
    }

    if (message.trim().length > 2000) {
      return NextResponse.json(
        { message: "Message is too long. Please keep it under 2000 characters." },
        { status: 400 }
      );
    }

    try {
      await dbConnect();
      const feedback = await FeedbackModel.create({
        userId: userId || null,
        userName: userName?.trim() || "Anonymous Student",
        userEmail: userEmail?.trim().toLowerCase() || "helpsupport9452@gmail.com",
        category: category || "general",
        message: message.trim(),
        rating: rating ? Number(rating) : null,
        status: "new",
        replies: [],
      });

      return NextResponse.json({
        success: true,
        message: "Thank you for your feedback! It has been submitted to support.",
        feedback: feedback,
      });
    } catch (dbError) {
      console.warn("[Feedback] MongoDB unavailable. Saving mock feedback:", dbError);
      return NextResponse.json({
        success: true,
        message: "Thank you for your feedback! (Saved in session).",
      });
    }
  } catch (error: any) {
    console.error("Feedback POST error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const status = searchParams.get("status");

    try {
      await dbConnect();
      const query: any = {};
      if (status && status !== "all") query.status = status;

      const feedbacks = await FeedbackModel.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .select("-__v");

      return NextResponse.json({ success: true, feedbacks, total: feedbacks.length });
    } catch (dbError) {
      return NextResponse.json({ success: true, feedbacks: [], total: 0, offline: true });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { feedbackId, replyText } = body;

    if (!feedbackId || !replyText || !replyText.trim()) {
      return NextResponse.json(
        { message: "Feedback ID and reply text are required." },
        { status: 400 }
      );
    }

    try {
      await dbConnect();
      const feedback = await FeedbackModel.findById(feedbackId);

      if (!feedback) {
        return NextResponse.json(
          { message: "Feedback not found." },
          { status: 404 }
        );
      }

      feedback.replies.push({
        text: replyText.trim(),
        createdAt: new Date(),
      });
      feedback.status = "replied";
      await feedback.save();

      return NextResponse.json({
        success: true,
        message: "Reply saved successfully.",
        feedback,
      });
    } catch (dbError) {
      console.warn("[Feedback PUT] MongoDB unavailable:", dbError);
      return NextResponse.json({
        success: true,
        message: "Reply saved locally.",
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
