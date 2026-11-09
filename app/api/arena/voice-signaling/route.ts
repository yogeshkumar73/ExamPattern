import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";

// In-memory fallback if database has temporary latency or connection issues
const memPeers = new Map<string, any>();
const memSignals: any[] = [];
const memRooms = new Map<string, any>();

async function getDB() {
  try {
    const mongoose = await dbConnect();
    return mongoose.connection.db;
  } catch (err) {
    console.warn("[Voice Signaling] DB fallback to memory:", err);
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action") || "counts";
  const peerId = searchParams.get("peerId");
  const roomId = searchParams.get("roomId");
  const fifteenSecAgo = new Date(Date.now() - 15000);

  const db = await getDB();

  // ── Action: Counts ──────────────────────────────────────────────────────────
  if (action === "counts") {
    if (db) {
      try {
        await db.collection("arena_voice_peers").deleteMany({ updatedAt: { $lt: fifteenSecAgo } });
        const agg = await db.collection("arena_voice_peers").aggregate([
          { $group: { _id: "$roomId", count: { $sum: 1 } } }
        ]).toArray();
        const counts: Record<string, number> = {};
        agg.forEach((item: any) => {
          if (item._id) counts[item._id] = item.count;
        });

        const customRooms = await db.collection("arena_custom_voice_rooms").find({}).limit(20).toArray();
        return NextResponse.json({ success: true, counts, customRooms });
      } catch (err) {
        console.error("[Voice Signaling] Counts DB error:", err);
      }
    }

    // Memory fallback
    const counts: Record<string, number> = {};
    const now = Date.now();
    memPeers.forEach((p, id) => {
      if (now - p.updatedAt > 15000) {
        memPeers.delete(id);
      } else {
        counts[p.roomId] = (counts[p.roomId] || 0) + 1;
      }
    });
    return NextResponse.json({ success: true, counts, customRooms: Array.from(memRooms.values()) });
  }

  // ── Action: Poll (Signals + Room Peers Heartbeat) ───────────────────────────
  if (action === "poll" && peerId) {
    if (db) {
      try {
        // Heartbeat
        if (roomId) {
          await db.collection("arena_voice_peers").updateOne(
            { peerId },
            { $set: { updatedAt: new Date(), roomId } }
          );
        }

        // Clean stale peers
        await db.collection("arena_voice_peers").deleteMany({ updatedAt: { $lt: fifteenSecAgo } });

        // Fetch queued signals for this peer
        const signals = await db
          .collection("arena_voice_signals")
          .find({ targetId: peerId })
          .sort({ createdAt: 1 })
          .limit(30)
          .toArray();

        if (signals.length > 0) {
          const ids = signals.map((s: any) => s._id);
          await db.collection("arena_voice_signals").deleteMany({ _id: { $in: ids } });
        }

        // Fetch active peers in same room
        let peers: any[] = [];
        if (roomId) {
          peers = await db
            .collection("arena_voice_peers")
            .find({ roomId, peerId: { $ne: peerId } })
            .toArray();
        }

        return NextResponse.json({
          success: true,
          peers: peers.map((p: any) => ({
            id: p.peerId,
            userId: p.userId,
            name: p.name,
            avatar: p.avatar,
            rank: p.rank,
            isMuted: p.isMuted,
            isSpeaking: p.isSpeaking,
          })),
          signals: signals.map((s: any) => ({
            fromId: s.fromId,
            type: s.type,
            payload: s.payload,
          })),
        });
      } catch (err) {
        console.error("[Voice Signaling] Poll DB error:", err);
      }
    }

    // Memory fallback for Poll
    const now = Date.now();
    if (roomId && memPeers.has(peerId)) {
      memPeers.get(peerId).updatedAt = now;
      memPeers.get(peerId).roomId = roomId;
    }
    const mySignals: any[] = [];
    for (let i = memSignals.length - 1; i >= 0; i--) {
      if (memSignals[i].targetId === peerId) {
        mySignals.unshift(memSignals.splice(i, 1)[0]);
      } else if (now - memSignals[i].createdAt > 30000) {
        memSignals.splice(i, 1);
      }
    }
    const roomPeers: any[] = [];
    memPeers.forEach((p, id) => {
      if (now - p.updatedAt > 15000) {
        memPeers.delete(id);
      } else if (p.roomId === roomId && id !== peerId) {
        roomPeers.push({
          id: p.peerId,
          userId: p.userId,
          name: p.name,
          avatar: p.avatar,
          rank: p.rank,
          isMuted: p.isMuted,
          isSpeaking: p.isSpeaking,
        });
      }
    });

    return NextResponse.json({
      success: true,
      peers: roomPeers,
      signals: mySignals.map((s: any) => ({
        fromId: s.fromId,
        type: s.type,
        payload: s.payload,
      })),
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    const db = await getDB();
    const fifteenSecAgo = new Date(Date.now() - 15000);

    // ── Action: Join ──────────────────────────────────────────────────────────
    if (action === "join") {
      const { roomId, peerId, userId, name, avatar, rank } = body;
      if (!roomId || !peerId || !userId) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      if (db) {
        try {
          await db.collection("arena_voice_peers").deleteMany({ updatedAt: { $lt: fifteenSecAgo } });

          await db.collection("arena_voice_peers").updateOne(
            { peerId },
            {
              $set: {
                peerId,
                roomId,
                userId,
                name: name || "Student",
                avatar: avatar || "",
                rank: rank || "Unranked",
                isMuted: false,
                updatedAt: new Date(),
              },
            },
            { upsert: true }
          );

          // Get existing peers in this room
          const existing = await db
            .collection("arena_voice_peers")
            .find({ roomId, peerId: { $ne: peerId } })
            .toArray();

          return NextResponse.json({
            success: true,
            peers: existing.map((p: any) => ({
              id: p.peerId,
              userId: p.userId,
              name: p.name,
              avatar: p.avatar,
              rank: p.rank,
              isMuted: p.isMuted,
            })),
          });
        } catch (err) {
          console.error("[Voice Signaling] Join DB error:", err);
        }
      }

      // Memory fallback
      memPeers.set(peerId, {
        peerId,
        roomId,
        userId,
        name: name || "Student",
        avatar: avatar || "",
        rank: rank || "Unranked",
        isMuted: false,
        updatedAt: Date.now(),
      });
      const existing: any[] = [];
      memPeers.forEach((p, id) => {
        if (p.roomId === roomId && id !== peerId && Date.now() - p.updatedAt <= 15000) {
          existing.push({
            id: p.peerId,
            userId: p.userId,
            name: p.name,
            avatar: p.avatar,
            rank: p.rank,
            isMuted: p.isMuted,
          });
        }
      });
      return NextResponse.json({ success: true, peers: existing });
    }

    // ── Action: Signal (Offer / Answer / Candidate) ───────────────────────────
    if (action === "signal") {
      const { targetId, fromId, roomId, type, payload } = body;
      if (!targetId || !fromId || !type || !payload) {
        return NextResponse.json({ error: "Missing signal data" }, { status: 400 });
      }

      if (db) {
        try {
          // Prune old signals
          await db
            .collection("arena_voice_signals")
            .deleteMany({ createdAt: { $lt: new Date(Date.now() - 30000) } });

          await db.collection("arena_voice_signals").insertOne({
            targetId,
            fromId,
            roomId,
            type,
            payload,
            createdAt: new Date(),
          });
          return NextResponse.json({ success: true });
        } catch (err) {
          console.error("[Voice Signaling] Signal DB error:", err);
        }
      }

      // Memory fallback
      memSignals.push({
        targetId,
        fromId,
        roomId,
        type,
        payload,
        createdAt: Date.now(),
      });
      return NextResponse.json({ success: true });
    }

    // ── Action: Leave ─────────────────────────────────────────────────────────
    if (action === "leave") {
      const { peerId } = body;
      if (peerId) {
        if (db) {
          try {
            await db.collection("arena_voice_peers").deleteOne({ peerId });
            await db.collection("arena_voice_signals").deleteMany({ targetId: peerId });
          } catch (err) {
            console.error("[Voice Signaling] Leave DB error:", err);
          }
        }
        memPeers.delete(peerId);
      }
      return NextResponse.json({ success: true });
    }

    // ── Action: Create Room ───────────────────────────────────────────────────
    if (action === "create-room") {
      const { room } = body;
      if (room?.id && room?.name) {
        if (db) {
          try {
            await db.collection("arena_custom_voice_rooms").updateOne(
              { id: room.id },
              { $set: { ...room, createdAt: new Date() } },
              { upsert: true }
            );
          } catch (err) {
            console.error("[Voice Signaling] Create Room DB error:", err);
          }
        }
        memRooms.set(room.id, room);
        return NextResponse.json({ success: true, room });
      }
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
