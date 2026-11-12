import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";
import FeedbackModel from "@/models/Feedback";

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// In-memory fallback storage for when MongoDB is disconnected or in cold start
declare global {
  var __mockFeedbacks: any[] | undefined;
}
if (!globalThis.__mockFeedbacks) {
  globalThis.__mockFeedbacks = [];
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`feedback:${ip}`, 10, 60 * 60 * 1000);
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

    const newFeedbackData = {
      userId: userId || null,
      userName: userName?.trim() || "Anonymous Student",
      userEmail: userEmail?.trim().toLowerCase() || "helpsupport9452@gmail.com",
      category: category || "general",
      message: message.trim(),
      rating: rating ? Number(rating) : null,
      status: "new",
      replies: [],
      createdAt: new Date(),
    };

    try {
      await dbConnect();
      const feedback = await FeedbackModel.create(newFeedbackData);

      return NextResponse.json({
        success: true,
        message: "Thank you for your feedback! It has been submitted to support.",
        feedback: feedback,
      });
    } catch (dbError) {
      console.warn("[Feedback] MongoDB unavailable. Saving mock feedback:", dbError);
      const mockItem = {
        _id: "fb-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
        ...newFeedbackData,
      };
      globalThis.__mockFeedbacks = [mockItem, ...(globalThis.__mockFeedbacks || [])];

      return NextResponse.json({
        success: true,
        message: "Thank you for your feedback! (Saved in session).",
        feedback: mockItem,
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

    const cutoff = new Date(Date.now() - TWENTY_FOUR_HOURS_MS);

    try {
      await dbConnect();

      // 1. Automatically purge any feedback older than 24 hours from MongoDB
      try {
        await FeedbackModel.deleteMany({ createdAt: { $lt: cutoff } });
      } catch (purgeErr) {
        console.warn("[Feedback] Auto-purge past 24h failed:", purgeErr);
      }

      // 2. Query only feedback submitted within the last 24 hours
      const query: any = {
        createdAt: { $gte: cutoff },
      };
      if (status && status !== "all") query.status = status;

      const feedbacks = await FeedbackModel.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .select("-__v");

      return NextResponse.json({
        success: true,
        feedbacks,
        total: feedbacks.length,
        autoExpiresAfter: "24h",
      });
    } catch (dbError) {
      // In-memory fallback: purge items older than 24 hours
      const now = Date.now();
      if (globalThis.__mockFeedbacks) {
        globalThis.__mockFeedbacks = globalThis.__mockFeedbacks.filter(
          (f: any) => now - new Date(f.createdAt).getTime() < TWENTY_FOUR_HOURS_MS
        );
      }
      const filtered = (globalThis.__mockFeedbacks || []).filter(
        (f: any) => !status || status === "all" || f.status === status
      );

      return NextResponse.json({
        success: true,
        feedbacks: filtered,
        total: filtered.length,
        offline: true,
        autoExpiresAfter: "24h",
      });
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

      // Dispatch platform notification to the user/student
      try {
        const { createNotification } = await import("@/lib/services/notificationService");
        const recipient = feedback.userId || feedback.userEmail;
        if (recipient) {
          await createNotification({
            userId: recipient,
            recipientEmail: feedback.userEmail || "",
            recipientName: feedback.userName || "Student",
            senderId: "admin",
            senderName: "Aura Support Team (helpsupport9452@gmail.com)",
            title: "💬 Admin Reply to Your Feedback",
            message: `Admin reply: "${replyText.trim()}"`,
            category: "message",
            priority: "normal",
            actionUrl: "/?step=feedback",
          });
        }
      } catch (notifErr) {
        console.warn("[Feedback PUT] Failed to send notification:", notifErr);
      }

      return NextResponse.json({
        success: true,
        message: "Reply saved and dispatched successfully.",
        feedback,
      });
    } catch (dbError) {
      console.warn("[Feedback PUT] MongoDB unavailable:", dbError);
      if (globalThis.__mockFeedbacks) {
        const item = globalThis.__mockFeedbacks.find((f: any) => f._id === feedbackId);
        if (item) {
          item.replies = item.replies || [];
          item.replies.push({ text: replyText.trim(), createdAt: new Date() });
          item.status = "replied";
        }
      }
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

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const purge = searchParams.get("purge");
    const cutoff = new Date(Date.now() - TWENTY_FOUR_HOURS_MS);

    try {
      await dbConnect();

      if (purge === "expired") {
        const res = await FeedbackModel.deleteMany({ createdAt: { $lt: cutoff } });
        return NextResponse.json({
          success: true,
          message: "Expired feedback purged successfully",
          deletedCount: res.deletedCount,
        });
      }

      if (id) {
        await FeedbackModel.findByIdAndDelete(id);
        return NextResponse.json({
          success: true,
          message: "Feedback removed successfully",
        });
      }
    } catch (dbError) {
      if (globalThis.__mockFeedbacks) {
        if (purge === "expired") {
          globalThis.__mockFeedbacks = globalThis.__mockFeedbacks.filter(
            (f: any) => Date.now() - new Date(f.createdAt).getTime() < TWENTY_FOUR_HOURS_MS
          );
        } else if (id) {
          globalThis.__mockFeedbacks = globalThis.__mockFeedbacks.filter((f: any) => f._id !== id);
        }
      }
      return NextResponse.json({ success: true, message: "Removed locally" });
    }

    return NextResponse.json(
      { success: false, message: "No feedback id or purge action provided." },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
