import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Battle from "@/models/Battle";

// Fast in-memory duel store with 20-minute expiry
interface DuelParticipant {
  userId: string;
  name: string;
  avatar: string;
  score: number;
  answered: number;
  correct: number;
  status: "waiting" | "ready" | "playing" | "finished";
  updatedAt: number;
}

interface DuelRoom {
  duelId: string;
  mode: string;
  difficulty: string;
  status: "waiting" | "playing" | "finished" | "expired";
  participants: Record<string, DuelParticipant>;
  createdAt: number;
  updatedAt: number;
  round: number;
}

const activeDuels = new Map<string, DuelRoom>();

// Clean up expired rooms (older than 20 minutes)
function cleanExpiredDuels() {
  const now = Date.now();
  for (const [id, room] of activeDuels.entries()) {
    if (now - room.updatedAt > 20 * 60 * 1000) {
      activeDuels.delete(id);
    }
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const duelId = searchParams.get("duelId");
  const userId = searchParams.get("userId");

  if (!duelId) {
    return NextResponse.json({ error: "duelId required" }, { status: 400 });
  }

  cleanExpiredDuels();

  let room = activeDuels.get(duelId);

  // If not in memory, try DB
  if (!room) {
    try {
      await dbConnect();
      const battle = await Battle.findOne({ roomId: duelId });
      if (battle) {
        const parts: Record<string, DuelParticipant> = {};
        (battle.participants || []).forEach((p: any) => {
          parts[p.userId] = {
            userId: p.userId,
            name: p.name || "Student",
            avatar: p.avatar || "",
            score: p.score || 0,
            answered: p.totalAnswers || 0,
            correct: p.correctAnswers || 0,
            status: p.finished ? "finished" : "playing",
            updatedAt: Date.now(),
          };
        });
        room = {
          duelId,
          mode: battle.mode || "math",
          difficulty: battle.difficulty || "intermediate",
          status: battle.status === "finished" ? "finished" : "playing",
          participants: parts,
          createdAt: battle.createdAt?.getTime() || Date.now(),
          updatedAt: Date.now(),
          round: 1,
        };
        activeDuels.set(duelId, room);
      }
    } catch (_) {}
  }

  if (!room) {
    return NextResponse.json({
      success: true,
      exists: false,
      message: "Duel room initializing",
    });
  }

  const now = Date.now();
  const timeElapsed = now - room.createdAt;
  if (room.status === "waiting" && timeElapsed > 60 * 1000) {
    room.status = "expired";
  }

  // Get opponent participant
  const allParts = Object.values(room.participants);
  const myParticipant = userId ? room.participants[userId] : null;
  const opponent = allParts.find((p) => p.userId !== userId) || null;

  return NextResponse.json({
    success: true,
    exists: true,
    duelId: room.duelId,
    mode: room.mode,
    difficulty: room.difficulty,
    status: room.status,
    round: room.round,
    me: myParticipant,
    opponent,
    allParticipants: allParts,
    remainingSeconds: Math.max(0, Math.ceil((60000 - timeElapsed) / 1000)),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, duelId, userId, name, avatar, score, answered, correct, status, mode, difficulty } = body;

    if (!duelId || !userId) {
      return NextResponse.json({ error: "duelId and userId required" }, { status: 400 });
    }

    cleanExpiredDuels();

    const now = Date.now();
    let room = activeDuels.get(duelId);

    if (action === "create") {
      room = {
        duelId,
        mode: mode || "math",
        difficulty: difficulty || "intermediate",
        status: "waiting",
        participants: {
          [userId]: {
            userId,
            name: name || "Student",
            avatar: avatar || "",
            score: 0,
            answered: 0,
            correct: 0,
            status: "waiting",
            updatedAt: now,
          },
        },
        createdAt: now,
        updatedAt: now,
        round: 1,
      };
      activeDuels.set(duelId, room);
      return NextResponse.json({
        success: true,
        duelId: room.duelId,
        mode: room.mode,
        difficulty: room.difficulty,
        status: room.status,
        expiresInSeconds: 60,
      });
    }

    if (action === "cancel" || action === "expire") {
      if (room) {
        room.status = "expired";
        room.updatedAt = now;
      }
      (async () => {
        try {
          await dbConnect();
          const Notification = (await import("@/models/Notification")).default;
          await Notification.deleteMany({ actionUrl: { $regex: duelId } });
        } catch (_) {}
      })();
      return NextResponse.json({
        success: true,
        message: "Duel expired or cancelled",
        duelId,
        status: "expired",
      });
    }

    if (!room) {
      room = {
        duelId,
        mode: mode || "math",
        difficulty: difficulty || "intermediate",
        status: "playing",
        participants: {},
        createdAt: now,
        updatedAt: now,
        round: 1,
      };
      activeDuels.set(duelId, room);
    }

    if (action === "join" || action === "sync") {
      const existing = room.participants[userId];
      room.participants[userId] = {
        userId,
        name: name || existing?.name || "Student",
        avatar: avatar || existing?.avatar || "",
        score: typeof score === "number" ? score : existing?.score || 0,
        answered: typeof answered === "number" ? answered : existing?.answered || 0,
        correct: typeof correct === "number" ? correct : existing?.correct || 0,
        status: status || existing?.status || "playing",
        updatedAt: now,
      };
      room.updatedAt = now;

      if (mode && !room.mode) room.mode = mode;
      if (difficulty && !room.difficulty) room.difficulty = difficulty;

      const allParts = Object.values(room.participants);
      if (allParts.length >= 2 && room.status === "waiting") {
        room.status = "playing";
      }
      const allFinished = allParts.length >= 2 && allParts.every((p) => p.status === "finished");
      if (allFinished) {
        room.status = "finished";
      }

      const opponent = allParts.find((p) => p.userId !== userId) || null;

      // Optional async DB touch in background
      (async () => {
        try {
          await dbConnect();
          await Battle.findOneAndUpdate(
            { roomId: duelId },
            {
              $set: {
                roomId: duelId,
                type: "1v1",
                mode: room?.mode || "math",
                difficulty: room?.difficulty || "intermediate",
                status: room?.status || "active",
                participants: allParts.map((p) => ({
                  userId: p.userId,
                  name: p.name,
                  avatar: p.avatar,
                  score: p.score,
                  correctAnswers: p.correct,
                  totalAnswers: p.answered,
                  finished: p.status === "finished",
                })),
              },
            },
            { upsert: true }
          );
        } catch (_) {}
      })();

      return NextResponse.json({
        success: true,
        duelId: room.duelId,
        mode: room.mode,
        difficulty: room.difficulty,
        status: room.status,
        round: room.round,
        opponent,
        allParticipants: allParts,
      });
    }

    if (action === "rematch") {
      room.round += 1;
      room.status = "playing";
      for (const uid of Object.keys(room.participants)) {
        room.participants[uid].score = 0;
        room.participants[uid].answered = 0;
        room.participants[uid].correct = 0;
        room.participants[uid].status = "playing";
        room.participants[uid].updatedAt = now;
      }
      room.updatedAt = now;
      return NextResponse.json({
        success: true,
        message: "Rematch initiated",
        duelId,
        round: room.round,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
