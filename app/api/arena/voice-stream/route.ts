import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface AudioChunk {
  id: string;
  roomId: string;
  peerId: string;
  userId: string;
  userName: string;
  timestamp: number;
  data: string; // Base64 audio/webm;codecs=opus or audio/wav
  isSpeaking: boolean;
  volume: number;
}

// In-memory sliding buffer of audio chunks per room
const roomAudioBuffers = new Map<string, AudioChunk[]>();
const roomActivePeers = new Map<
  string,
  Map<string, { lastSeen: number; name: string; isSpeaking: boolean; volume: number }>
>();

const MAX_CHUNKS_PER_ROOM = 80;
const CHUNK_TTL_MS = 15000;

function cleanupStaleChunks(roomId: string) {
  const chunks = roomAudioBuffers.get(roomId);
  const now = Date.now();
  if (chunks) {
    const valid = chunks.filter((c) => now - c.timestamp < CHUNK_TTL_MS);
    if (valid.length === 0) {
      roomAudioBuffers.delete(roomId);
    } else {
      roomAudioBuffers.set(roomId, valid.slice(-MAX_CHUNKS_PER_ROOM));
    }
  }

  const peers = roomActivePeers.get(roomId);
  if (peers) {
    for (const [pId, info] of peers.entries()) {
      if (now - info.lastSeen > 20000) {
        peers.delete(pId);
      }
    }
    if (peers.size === 0) {
      roomActivePeers.delete(roomId);
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomId, peerId, userId, userName, data, isSpeaking, volume, timestamp } = body;

    if (!roomId || !peerId) {
      return NextResponse.json({ error: "roomId and peerId are required" }, { status: 400 });
    }

    const now = Date.now();
    cleanupStaleChunks(roomId);

    // Track active peer presence
    if (!roomActivePeers.has(roomId)) {
      roomActivePeers.set(roomId, new Map());
    }
    roomActivePeers.get(roomId)!.set(peerId, {
      lastSeen: now,
      name: userName || "Student",
      isSpeaking: Boolean(isSpeaking),
      volume: typeof volume === "number" ? volume : 0,
    });

    // If audio data payload is included, push into buffer
    if (data && typeof data === "string" && data.length > 0) {
      if (!roomAudioBuffers.has(roomId)) {
        roomAudioBuffers.set(roomId, []);
      }
      const buffer = roomAudioBuffers.get(roomId)!;
      const chunk: AudioChunk = {
        id: `${peerId}-${now}-${Math.random().toString(36).substring(2, 6)}`,
        roomId,
        peerId,
        userId: userId || peerId,
        userName: userName || "Student",
        timestamp: timestamp || now,
        data,
        isSpeaking: isSpeaking ?? true,
        volume: volume || 50,
      };
      buffer.push(chunk);
      if (buffer.length > MAX_CHUNKS_PER_ROOM) {
        buffer.shift();
      }
    }

    return NextResponse.json(
      { success: true, timestamp: now },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "X-Accel-Buffering": "no",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process audio stream" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");
    const peerId = searchParams.get("peerId");
    const since = parseInt(searchParams.get("since") || "0", 10);

    if (!roomId || !peerId) {
      return NextResponse.json({ error: "roomId and peerId are required" }, { status: 400 });
    }

    const now = Date.now();
    cleanupStaleChunks(roomId);

    // Update heartbeat
    if (!roomActivePeers.has(roomId)) {
      roomActivePeers.set(roomId, new Map());
    }
    const peerMap = roomActivePeers.get(roomId)!;
    if (peerMap.has(peerId)) {
      peerMap.get(peerId)!.lastSeen = now;
    }

    // Get chunks from other peers in this room created after `since`
    const chunks = roomAudioBuffers.get(roomId) || [];
    const newChunks = chunks.filter(
      (c) => c.peerId !== peerId && c.timestamp > since
    );

    // List active peers
    const activePeers: any[] = [];
    peerMap.forEach((info, pId) => {
      if (pId !== peerId && now - info.lastSeen < 12000) {
        activePeers.push({
          peerId: pId,
          name: info.name,
          isSpeaking: info.isSpeaking,
          volume: info.volume,
        });
      }
    });

    return NextResponse.json(
      {
        success: true,
        roomId,
        chunks: newChunks,
        peers: activePeers,
        timestamp: now,
      },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "X-Accel-Buffering": "no",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to poll audio stream" }, { status: 500 });
  }
}
