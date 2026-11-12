import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import CustomArenaRoom from "@/models/CustomArenaRoom";
import { failureLogger } from "@/lib/services/failure-logger";
import { lazyServiceManager } from "@/lib/services/lazy-service-manager";

export const dynamic = "force-dynamic";

// In-memory fallback if MongoDB is in offline mode
const memoryRooms = new Map<string, any>();

function computeTextSimilarity(studentAnswer: string, modelAnswer: string, keywords: string[] = []): { score: number; similarity: number; isCorrect: boolean; feedback: string } {
  if (!studentAnswer || !studentAnswer.trim()) {
    return { score: 0, similarity: 0, isCorrect: false, feedback: "No answer provided." };
  }
  const cleanStudent = studentAnswer.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  const cleanModel = modelAnswer.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);

  const studentSet = new Set(cleanStudent);
  const modelSet = new Set(cleanModel);

  let matchCount = 0;
  for (const word of studentSet) {
    if (modelSet.has(word)) matchCount++;
  }

  const keywordMatches = (keywords || []).filter(kw => 
    studentAnswer.toLowerCase().includes(kw.toLowerCase())
  );

  const overlapRatio = matchCount / Math.max(1, modelSet.size);
  const keywordRatio = keywords.length > 0 ? (keywordMatches.length / keywords.length) : overlapRatio;
  const similarity = Math.min(1, Math.round(((overlapRatio * 0.5) + (keywordRatio * 0.5)) * 100) / 100);

  const isCorrect = similarity >= 0.5;
  const score = Math.round(similarity * 10);
  let feedback = "Good explanation matching core concepts.";
  if (similarity < 0.3) feedback = "Answer missing key principles from source document.";
  else if (similarity < 0.6) feedback = "Partially correct with partial keyword coverage.";

  return { score, similarity, isCorrect, feedback };
}

function cleanDocumentText(content: string): string {
  if (!content) return "";
  let text = content;
  // If text contains PDF binary markers or stream junk, sanitize it
  if (text.includes("%PDF") || text.includes("/Filter") || text.includes("endstream")) {
    text = text.replace(/%PDF-[\s\S]*?stream/g, " ")
               .replace(/endstream[\s\S]*?stream/g, " ")
               .replace(/xref[\s\S]*?%%EOF/g, " ")
               .replace(/[^\x20-\x7E\t\r\n]/g, " ");
  }
  return text.replace(/\s+/g, " ").trim();
}

// Generate fallback RAG questions if Python battle service is offline
function generateLocalQuestions(content: string, count: number, format: string) {
  const cleaned = cleanDocumentText(content);
  const sentences = cleaned
    .split(/[.\n;]+/)
    .map(s => s.trim())
    .filter(s => s.length > 20);

  const defaults = [
    "Machine learning algorithms utilize gradient descent to optimize parameter weights across dimensional hyperplanes.",
    "Database normalization prevents redundant anomalies and ensures referential integrity across relation tables.",
    "Dynamic programming decomposes complex recursive problems into overlapping subproblems with memoization.",
    "Newton's third law states that for every action force, there is an equal and opposite reaction force.",
    "Object-oriented encapsulation bundles state and operations within objects to prevent unauthorized direct state mutation."
  ];

  const pool = sentences.length >= count ? sentences : [...sentences, ...defaults];
  const list = [];
  const permutations = [
    [0, 1, 2, 3],
    [1, 0, 3, 2],
    [2, 3, 0, 1],
    [3, 2, 1, 0],
  ];

  for (let i = 0; i < count; i++) {
    const raw = pool[i % pool.length];
    const words = raw.split(/\s+/).filter(w => w.length > 3 && /^[a-zA-Z]+$/.test(w));
    const key = words[0] || "Architecture Component";
    const isWritten = format === "written" || (format === "mixed" && i % 2 === 1);

    if (isWritten) {
      list.push({
        id: `cq-${i + 1}-${Date.now().toString(36)}`,
        question: `Explain the fundamental concept and architecture of: "${raw.slice(0, 80)}..."`,
        type: "written",
        modelAnswer: raw,
        keywords: words.slice(0, 5),
        explanation: `Model answer from document: ${raw}`,
        points: 10,
      });
    } else {
      const correctOption = raw;
      const altSentence = pool[(i + 1) % pool.length];
      const distractor1 = pool.length > 1
        ? `Requires substituting ${key} with: ${altSentence.slice(0, 65)}.`
        : `Directly conflicts with ${key} causing exponential divergence under load.`;
      const distractor2 = `Applies strictly in static non-deterministic environments with zero network latency.`;
      const distractor3 = `A deprecated legacy standard superseded by autonomous decentralized pipelines.`;

      const rawOptions = [correctOption, distractor1, distractor2, distractor3];
      const perm = permutations[i % permutations.length];
      const shuffledOptions = perm.map(idx => rawOptions[idx]);
      const correctIdx = perm.indexOf(0);

      list.push({
        id: `cq-${i + 1}-${Date.now().toString(36)}`,
        question: `According to the uploaded material, which statement accurately describes ${key}?`,
        type: "mcq",
        options: shuffledOptions,
        correctIndex: correctIdx,
        correctOption: correctIdx,
        explanation: `Document reference: ${raw}`,
        points: 10,
      });
    }
  }
  return list;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");
    const roomCode = searchParams.get("roomCode");
    const type = searchParams.get("type"); // 'public' | 'user'

    try {
      await dbConnect();
    } catch (_) {}

    // Find specific room
    if (roomId || roomCode) {
      let room = null;
      try {
        room = await CustomArenaRoom.findOne(roomId ? { roomId } : { roomCode }).lean();
      } catch (_) {}

      if (!room && roomId) {
        room = memoryRooms.get(roomId);
      }

      if (!room) {
        return NextResponse.json({ success: false, message: "Room not found." }, { status: 404 });
      }

      return NextResponse.json({ success: true, room });
    }

    // List Public Live Games for other students to click 'Join Now'
    if (type === "public") {
      let publicRooms: any[] = [];
      try {
        publicRooms = await CustomArenaRoom.find({
          isPrivate: false,
          status: { $in: ["waiting", "playing"] },
        })
          .sort({ createdAt: -1 })
          .limit(20)
          .lean();
      } catch (_) {}

      if (publicRooms.length === 0) {
        publicRooms = Array.from(memoryRooms.values()).filter(
          r => !r.isPrivate && (r.status === "waiting" || r.status === "playing")
        );
      }

      return NextResponse.json({ success: true, rooms: publicRooms });
    }

    // List all active or recent rooms
    let allRooms: any[] = [];
    try {
      allRooms = await CustomArenaRoom.find({})
        .sort({ createdAt: -1 })
        .limit(25)
        .lean();
    } catch (_) {}

    if (allRooms.length === 0) {
      allRooms = Array.from(memoryRooms.values());
    }

    return NextResponse.json({ success: true, rooms: allRooms });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const title = body.title || "Custom Study Clash";
    const hostId = body.hostId || body.userId || `host-${Date.now().toString(36)}`;
    const hostName = body.hostName || body.userName || "Host Student";
    const hostAvatar = body.hostAvatar || body.userAvatar || "";
    const isPrivate = body.isPrivate ?? false;
    const password = body.password || "";
    const matchType = body.matchType || "open";
    const examFormat = body.examFormat || "mcqs";
    const documentSource = body.documentSource || body.documentType || "text";
    const documentName = body.documentName || "Study Material";
    const documentContent = body.documentContent || "";
    const maxPlayers = body.maxPlayers || 4;
    const questionCount = body.questionCount || 5;
    const timeLimitSeconds = body.timeLimitSeconds || (body.timeLimitMinutes ? Number(body.timeLimitMinutes) * 60 : 600);

    const roomId = `room-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const roomCode = `CLASH-${Math.floor(1000 + Math.random() * 9000)}`;
    const qCount = Math.max(2, Math.min(20, questionCount || 5));
    const format = examFormat || "mcqs";
    const docText = (documentContent || "").trim() || "Core academic principles of problem solving and analytical thinking.";

    // Try Python generator first, fallback to intelligent local generator
    let questions = [];
    try {
      const pyRes = await fetch("http://localhost:8001/api/custom-exam/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentText: docText,
          questionCount: qCount,
          examFormat: format,
          subject: title || "Custom Clash",
        }),
        signal: AbortSignal.timeout(3000),
      });
      if (pyRes.ok) {
        const pyData = await pyRes.json();
        if (Array.isArray(pyData.questions) && pyData.questions.length > 0) {
          questions = pyData.questions;
        }
      }
    } catch (_) {}

    if (questions.length === 0) {
      questions = generateLocalQuestions(docText, qCount, format);
    }

    const initialParticipant = {
      userId: hostId,
      name: hostName,
      avatar: hostAvatar || "",
      team: matchType === "team" ? "Team Alpha" : "Solo",
      score: 0,
      answers: [],
      accuracy: 0,
      speedSeconds: 0,
      finished: false,
      joinedAt: new Date(),
    };

    const roomData = {
      roomId,
      roomCode,
      password: password || "",
      isPrivate: Boolean(isPrivate),
      title: title || "Custom Study Clash",
      hostId,
      hostName,
      hostAvatar: hostAvatar || "",
      matchType: matchType || "open",
      examFormat: format,
      documentSource: documentSource || "text",
      documentName: documentName || "Study Notes",
      documentContent: docText,
      maxPlayers: Math.max(2, Math.min(16, maxPlayers || 4)),
      questionCount: questions.length,
      timeLimitSeconds: Math.max(60, timeLimitSeconds || 300),
      status: "waiting",
      questions,
      participants: [initialParticipant],
      teamScores: { "Team Alpha": 0, "Team Beta": 0 },
      createdAt: new Date(),
    };

    // Store in DB & memory
    try {
      await dbConnect();
      const created = await CustomArenaRoom.create(roomData);
      return NextResponse.json({ success: true, room: created });
    } catch (dbErr) {
      memoryRooms.set(roomId, roomData);
      return NextResponse.json({ success: true, room: roomData, mode: "offline" });
    }
  } catch (err: any) {
    failureLogger.recordFailure({
      endpoint: "/api/arena/custom-room",
      method: "POST",
      statusCode: 500,
      errorMessage: err.message || "Failed to create custom clash room",
      latencyMs: 75,
      service: "rag-custom-exam"
    });
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action;
    const roomId = body.roomId;
    const userId = body.userId || body.hostId;
    const name = body.name || body.userName || "Student";
    const avatar = body.avatar || body.userAvatar || "";
    const password = body.password;
    const team = body.team;
    const updates = body.updates;
    const questionId = body.questionId;
    const studentAnswer = body.studentAnswer !== undefined ? body.studentAnswer : body.answer;
    const timeTaken = body.timeTaken;

    if (!roomId) {
      return NextResponse.json({ success: false, message: "roomId required." }, { status: 400 });
    }

    try {
      await dbConnect();
    } catch (_) {}

    let room: any = null;
    try {
      room = await CustomArenaRoom.findOne({ roomId });
    } catch (_) {}

    if (!room) {
      room = memoryRooms.get(roomId);
    }

    if (!room) {
      return NextResponse.json({ success: false, message: "Room not found." }, { status: 404 });
    }

    // 1. UPDATE RULES & TIMING (Creator / Host Only)
    if (action === "update_rules") {
      if (room.hostId !== userId) {
        return NextResponse.json({ success: false, message: "Only the host can modify match rules and timing." }, { status: 403 });
      }

      if (updates) {
        if (updates.title) room.title = updates.title;
        if (updates.timeLimitSeconds) room.timeLimitSeconds = Number(updates.timeLimitSeconds);
        if (updates.maxPlayers) room.maxPlayers = Number(updates.maxPlayers);
        if (updates.isPrivate !== undefined) room.isPrivate = Boolean(updates.isPrivate);
        if (updates.password !== undefined) room.password = String(updates.password);
        if (updates.matchType) room.matchType = updates.matchType;
      }

      if (typeof room.save === "function") await room.save();
      memoryRooms.set(roomId, room);
      return NextResponse.json({ success: true, message: "Rules updated successfully.", room });
    }

    // 2. JOIN ROOM
    if (action === "join") {
      if (room.isPrivate && room.password && room.password !== password) {
        return NextResponse.json({ success: false, message: "Incorrect team password." }, { status: 401 });
      }

      const existingIndex = room.participants.findIndex((p: any) => p.userId === userId);
      if (existingIndex === -1) {
        if (room.participants.length >= room.maxPlayers) {
          return NextResponse.json({ success: false, message: "Room is already full." }, { status: 400 });
        }

        // Evenly distribute teams if team battle
        let assignedTeam = team || (room.matchType === "team" ? (room.participants.length % 2 === 0 ? "Team Alpha" : "Team Beta") : "Solo");

        room.participants.push({
          userId,
          name: name || "Student",
          avatar: avatar || "",
          team: assignedTeam,
          score: 0,
          answers: [],
          accuracy: 0,
          speedSeconds: 0,
          finished: false,
          joinedAt: new Date(),
        });
      }

      if (typeof room.save === "function") await room.save();
      memoryRooms.set(roomId, room);
      return NextResponse.json({ success: true, message: "Joined room successfully.", room });
    }

    // 3. CHANGE TEAM
    if (action === "change_team") {
      const p = room.participants.find((item: any) => item.userId === userId);
      if (p) {
        p.team = team;
        if (typeof room.save === "function") await room.save();
        memoryRooms.set(roomId, room);
      }
      return NextResponse.json({ success: true, room });
    }

    // 4. START MATCH (Creator / Host Only)
    if (action === "start") {
      if (room.hostId !== userId) {
        return NextResponse.json({ success: false, message: "Only the host can start the clash." }, { status: 403 });
      }

      room.status = "playing";
      room.startedAt = new Date();
      room.expiresAt = new Date(Date.now() + (room.timeLimitSeconds * 1000));

      if (typeof room.save === "function") await room.save();
      memoryRooms.set(roomId, room);
      return NextResponse.json({ success: true, message: "Match started!", room });
    }

    // 5. SUBMIT ANSWER (Multiplayer Synchronized Question Solving)
    if (action === "submit_answer") {
      const p = room.participants.find((item: any) => item.userId === userId);
      if (!p) {
        return NextResponse.json({ success: false, message: "Participant not found." }, { status: 404 });
      }

      const q = room.questions.find((item: any) => item.id === questionId);
      if (!q) {
        return NextResponse.json({ success: false, message: "Question not found." }, { status: 404 });
      }

      let isCorrect = false;
      let pointsEarned = 0;
      let similarityScore = 0;
      let feedback = "";

      if (q.type === "mcq") {
        const correctTarget = q.correctIndex !== undefined ? q.correctIndex : q.correctOption;
        isCorrect = Number(studentAnswer) === Number(correctTarget);
        pointsEarned = isCorrect ? (q.points || 10) : 0;
        feedback = isCorrect ? "Correct answer!" : `Incorrect. Correct option was #${(Number(correctTarget) || 0) + 1}.`;
        similarityScore = isCorrect ? 1.0 : 0.0;
      } else {
        // Written Question Evaluation via Python ML Service or NumPy Fallback
        try {
          const pyRes = await fetch("http://localhost:8001/api/custom-exam/evaluate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              studentAnswer: String(studentAnswer || ""),
              modelAnswer: q.modelAnswer || "",
              keywords: q.keywords || [],
              maxPoints: q.points || 10,
            }),
            signal: AbortSignal.timeout(3000),
          });
          if (pyRes.ok) {
            const pyData = await pyRes.json();
            pointsEarned = pyData.score || 0;
            similarityScore = pyData.similarity || 0;
            isCorrect = pyData.isCorrect ?? (pyData.percentage >= 60);
            feedback = pyData.feedback || "Evaluated by Python ML Engine.";
          } else {
            throw new Error("Python eval non-200");
          }
        } catch (_) {
          const localEval = computeTextSimilarity(String(studentAnswer || ""), q.modelAnswer || "", q.keywords || []);
          pointsEarned = localEval.score;
          similarityScore = localEval.similarity;
          isCorrect = localEval.isCorrect;
          feedback = localEval.feedback;
        }
      }

      // Record answer
      const existingAns = p.answers.find((a: any) => a.questionId === questionId);
      if (existingAns) {
        existingAns.studentAnswer = studentAnswer;
        existingAns.isCorrect = isCorrect;
        existingAns.score = pointsEarned;
        existingAns.similarity = similarityScore;
        existingAns.feedback = feedback;
      } else {
        p.answers.push({
          questionId,
          studentAnswer,
          isCorrect,
          score: pointsEarned,
          similarity: similarityScore,
          feedback,
        });
      }

      // Recalculate participant total score & accuracy
      const totalScore = p.answers.reduce((acc: number, curr: any) => acc + (curr.score || 0), 0);
      const correctCount = p.answers.filter((a: any) => a.isCorrect).length;
      p.score = totalScore;
      p.accuracy = Math.round((correctCount / Math.max(1, p.answers.length)) * 100);
      if (timeTaken) p.speedSeconds = Number(timeTaken);

      // Check if participant finished all questions
      if (p.answers.length >= room.questions.length) {
        p.finished = true;
      }

      // Update team scores
      const teamAlphaScore = room.participants
        .filter((part: any) => part.team === "Team Alpha")
        .reduce((sum: number, part: any) => sum + (part.score || 0), 0);
      const teamBetaScore = room.participants
        .filter((part: any) => part.team === "Team Beta")
        .reduce((sum: number, part: any) => sum + (part.score || 0), 0);

      room.teamScores = {
        "Team Alpha": teamAlphaScore,
        "Team Beta": teamBetaScore,
        alpha: teamAlphaScore,
        beta: teamBetaScore,
      };

      // Check if all players finished
      if (room.participants.every((part: any) => part.finished)) {
        room.status = "completed";
        room.completedAt = new Date();
        room.winnerTeam = teamAlphaScore >= teamBetaScore ? "Team Alpha" : "Team Beta";
        const topUser = [...room.participants].sort((a, b) => b.score - a.score)[0];
        if (topUser) {
          room.winnerUser = { userId: topUser.userId, name: topUser.name, score: topUser.score };
        }
      }

      if (typeof room.save === "function") await room.save();
      memoryRooms.set(roomId, room);

      return NextResponse.json({
        success: true,
        evaluation: { isCorrect, score: pointsEarned, similarity: similarityScore, feedback },
        participant: p,
        room,
      });
    }

    // 6. FINISH MATCH
    if (action === "finish") {
      const p = room.participants.find((item: any) => item.userId === userId);
      if (p) p.finished = true;

      if (room.hostId === userId || room.participants.every((part: any) => part.finished)) {
        room.status = "completed";
        room.completedAt = new Date();

        const alphaTotal = room.participants
          .filter((part: any) => part.team === "Team Alpha")
          .reduce((sum: number, part: any) => sum + (part.score || 0), 0);
        const betaTotal = room.participants
          .filter((part: any) => part.team === "Team Beta")
          .reduce((sum: number, part: any) => sum + (part.score || 0), 0);

        room.winnerTeam = alphaTotal >= betaTotal ? "Team Alpha" : "Team Beta";
        const topUser = [...room.participants].sort((a, b) => b.score - a.score)[0];
        if (topUser) {
          room.winnerUser = { userId: topUser.userId, name: topUser.name, score: topUser.score };
        }
      }

      if (typeof room.save === "function") await room.save();
      memoryRooms.set(roomId, room);
      return NextResponse.json({ success: true, room });
    }

    return NextResponse.json({ success: false, message: "Unknown action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");
    const userId = searchParams.get("userId");

    if (!roomId || !userId) {
      return NextResponse.json({ success: false, message: "roomId and userId required." }, { status: 400 });
    }

    try {
      await dbConnect();
      const room = await CustomArenaRoom.findOne({ roomId });
      if (room && room.hostId !== userId) {
        return NextResponse.json({ success: false, message: "Only the host can delete the room." }, { status: 403 });
      }
      await CustomArenaRoom.deleteOne({ roomId });
    } catch (_) {}

    memoryRooms.delete(roomId);
    return NextResponse.json({ success: true, message: "Room deleted successfully." });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
