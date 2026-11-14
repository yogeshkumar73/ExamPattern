import { type NextRequest, NextResponse } from "next/server";

// In-memory ring buffer of recent webhook events for fast retrieval and telemetry
interface WebhookEvent {
  id: string;
  type: string;
  topicCount?: number;
  progressPercent?: number;
  message?: string;
  executionTimeMs?: number;
  timestamp: string;
}

const recentEvents: WebhookEvent[] = [];

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json().catch(() => ({}));
    const eventType = payload.event || payload.type || "analysis.progress";

    const eventRecord: WebhookEvent = {
      id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: eventType,
      topicCount: payload.topicsCount || payload.topicCount,
      progressPercent: payload.progressPercent ?? 100,
      message: payload.message || "Exam pattern analyzed via fast protocol",
      executionTimeMs: payload.executionTimeMs,
      timestamp: new Date().toISOString()
    };

    recentEvents.unshift(eventRecord);
    if (recentEvents.length > 50) {
      recentEvents.pop();
    }

    // Broadcast through socket.io if available
    if (typeof (global as any).io !== "undefined") {
      try {
        (global as any).io.emit("analysis_webhook_event", eventRecord);
      } catch (e) {
        console.warn("[WEBHOOK] Socket broadcast error:", e);
      }
    }

    return NextResponse.json(
      {
        received: true,
        eventId: eventRecord.id,
        protocol: "HTTP2_WEBHOOK",
        status: "acknowledged"
      },
      {
        headers: {
          "X-Protocol": "HTTP/2",
          "X-Webhook-Delivery": "instant"
        }
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to process analysis webhook." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const streamMode = searchParams.get("stream") === "true";

  if (streamMode) {
    // Return HTTP/2 Server-Sent Events stream for live analysis progress
    const responseStream = new TransformStream();
    const writer = responseStream.writable.getWriter();
    const encoder = new TextEncoder();

    // Send immediate handshake
    writer.write(encoder.encode(`event: handshake\ndata: ${JSON.stringify({ status: "connected", protocol: "HTTP/2_SSE" })}\n\n`));

    // Send latest event
    if (recentEvents.length > 0) {
      writer.write(encoder.encode(`event: update\ndata: ${JSON.stringify(recentEvents[0])}\n\n`));
    }

    // Close stream after brief burst
    setTimeout(() => {
      writer.close().catch(() => {});
    }, 15000);

    return new Response(responseStream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Protocol": "HTTP/2"
      }
    });
  }

  // Standard JSON GET for latest webhook events
  return NextResponse.json({
    status: "active",
    protocol: "HTTP/2",
    totalEvents: recentEvents.length,
    recentEvents: recentEvents.slice(0, 10)
  });
}
