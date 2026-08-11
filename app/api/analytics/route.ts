import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import {
  logAnalyticsEvent,
  listAnalytics,
} from "@/lib/services/analyticsService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const userId = req.nextUrl.searchParams.get("userId")?.trim() || undefined;

    const events = await listAnalytics(userId);

    return NextResponse.json(
      {
        success: true,
        events,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Analytics GET Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch analytics.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const userId =
      typeof body.userId === "string" ? body.userId.trim() : null;

    const eventType =
      typeof body.eventType === "string"
        ? body.eventType.trim()
        : "";

    const payload =
      body.payload && typeof body.payload === "object"
        ? body.payload
        : {};

    if (!eventType) {
      return NextResponse.json(
        {
          success: false,
          message: "eventType is required.",
        },
        { status: 400 }
      );
    }

    await dbConnect();

    const event = await logAnalyticsEvent(
      userId,
      eventType,
      payload
    );

    return NextResponse.json(
      {
        success: true,
        event,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Analytics POST Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to log analytics event.",
      },
      { status: 500 }
    );
  }
}