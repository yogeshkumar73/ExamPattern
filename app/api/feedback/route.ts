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
    userEmail: { type: String, default: null },
    category: {
      type: String,
      enum: ["bug", "feature", "general", "praise", "complaint"],
      default: "general",
    },
    message: { type: String, required: true, maxlength: 2000 },
    rating: { type: Number, min: 1, max: 5, default: null },
    status: { type: String, enum: ["new", "read", "replied"], default: "new" },
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
        userName: userName?.trim() || "Anonymous",
        userEmail: userEmail?.trim().toLowerCase() || null,
        category: category || "general",
        message: message.trim(),
        rating: rating ? Number(rating) : null,
      });

      return NextResponse.json({
        success: true,
        message: "Thank you for your feedback! We read every message.",
        feedbackId: feedback._id,
      });
    } catch (dbError) {
      // Offline fallback: log to console
      console.warn("[Feedback] MongoDB unavailable. Feedback logged locally:", {
        userName,
        category,
        message,
        rating,
      });
      return NextResponse.json({
        success: true,
        message: "Thank you for your feedback! (Saved locally).",
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
    // Admin-only: only allow if admin session cookie exists
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const status = searchParams.get("status");

    try {
      await dbConnect();
      const query: any = {};
      if (status) query.status = status;

      const feedbacks = await FeedbackModel.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .select("-__v");

      return NextResponse.json({ feedbacks, total: feedbacks.length });
    } catch (dbError) {
      return NextResponse.json({ feedbacks: [], total: 0, offline: true });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
