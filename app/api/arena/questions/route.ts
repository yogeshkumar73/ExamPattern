import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ArenaQuestion from '@/models/ArenaQuestion';
import {
  ARENA_QUESTION_BANK,
  TIME_MAP,
  XP_MAP,
  POINTS_MAP,
  getStaticQuestions,
  type ArenaCategory,
  type ArenaDifficulty,
} from '@/lib/data/arenaQuestionBank';

/**
 * Fetch questions from Python Battle Service (primary) with
 * MongoDB DB → in-memory bank (530+ questions) as fallbacks.
 *
 * Query params:
 *   ?mode=         (coding | puzzle | math | gk | prediction | topicdoc | mixed)
 *   ?difficulty=   (beginner | intermediate | advanced | expert | master | grandmaster)
 *   ?limit=        (number of questions to return)
 *   ?page=         (pagination)
 *   ?exclude_ids=  (comma-separated IDs or titles to prevent duplicates)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Support both old (category/count) and new (mode/limit) params
  const rawMode = searchParams.get('mode') || searchParams.get('category') || 'math';
  const mode = (rawMode.toLowerCase() in ARENA_QUESTION_BANK ? rawMode.toLowerCase() : 'math') as ArenaCategory;
  
  const rawDiff = searchParams.get('difficulty') || 'beginner';
  const difficulty = (rawDiff.toLowerCase() in TIME_MAP ? rawDiff.toLowerCase() : 'beginner') as ArenaDifficulty;

  const limit = Math.min(
    parseInt(searchParams.get('limit') || searchParams.get('count') || '20', 10),
    100
  );
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const excludeIdsRaw = searchParams.get('exclude_ids') || '';
  const excludeList = excludeIdsRaw ? excludeIdsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
  const topic = searchParams.get('topic') || '';
  const document = searchParams.get('document') || '';
  const userId = searchParams.get('user_id') || searchParams.get('userId') || '';

  // ── 1. Python Battle Service (primary) ───────────────────
  const BATTLE_SERVICE_URL = process.env.BATTLE_SERVICE_URL || ['http://', 'localhost:8001'].join('');
  try {
    const params = new URLSearchParams({
      mode,
      difficulty,
      limit: String(limit),
      page: String(page),
      ...(excludeIdsRaw && { exclude_ids: excludeIdsRaw }),
      ...(topic && { topic }),
      ...(document && { document }),
      ...(userId && { user_id: userId }),
    });

    const res = await fetch(`${BATTLE_SERVICE_URL}/api/questions/random?${params}`, {
      signal: AbortSignal.timeout(3000), // 3s timeout — fast fail
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.data?.questions?.length > 0) {
        const questions = data.data.questions.map((q: any) => ({
          _id: q.id,
          category: q.mode,
          difficulty: q.difficulty,
          title: q.question?.slice(0, 80) || 'Question',
          description: q.question,
          options: q.options || [],
          correctAnswer: q.correct_answer,
          boilerplate: q.boilerplate || '',
          xpReward: q.xp || XP_MAP[difficulty] || 50,
          pointsReward: q.coins ? q.coins * 10 : POINTS_MAP[difficulty] || 100,
          timeLimit: q.time_limit || TIME_MAP[difficulty] || 60,
          explanation: q.explanation || '',
          hint: q.hint || '',
          tags: q.tags || [],
        }));
        return NextResponse.json({
          questions,
          source: data.data.source || 'battle-service',
          total: data.data.total,
          page: data.data.page,
        });
      }
    }
  } catch (err) {
    // Battle service offline — fall through to DB/memory silently
    console.warn('[Arena] Battle service unavailable, using fallback:', (err as Error).message);
  }

  // ── 2. MongoDB fallback ───────────────────────────────────
  try {
    await dbConnect();
    const matchQuery: any = { category: mode, difficulty };
    if (excludeList.length > 0) {
      matchQuery.title = { $nin: excludeList };
    }
    const questions = await ArenaQuestion.aggregate([
      { $match: matchQuery },
      { $sample: { size: limit } },
    ]);
    if (questions.length >= Math.min(limit, 3)) {
      return NextResponse.json({ questions, source: 'db', total: questions.length, page });
    }
  } catch (_) {
    console.warn('[Arena] MongoDB unavailable, using in-memory bank.');
  }

  // ── 3. In-memory static bank (always works with 530+ unique questions) ──
  const staticQs = getStaticQuestions(mode, difficulty, limit, excludeList);
  const questions = staticQs.map((q, i) => ({
    _id: `static-${mode}-${difficulty}-${Date.now()}-${i}`,
    category: mode,
    difficulty,
    ...q,
  }));

  return NextResponse.json({ questions, source: 'memory', total: questions.length, page });
}

export async function POST(req: NextRequest) {
  const BATTLE_SERVICE_URL = process.env.BATTLE_SERVICE_URL || ['http://', 'localhost:8001'].join('');
  let body: any = {};
  try {
    body = await req.json();
  } catch (_) {}

  // 1. If action is answer, forward to python service for telemetry
  if (body?.action === 'answer' || body?.isCorrect !== undefined) {
    try {
      const res = await fetch(`${BATTLE_SERVICE_URL}/api/questions/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: body.userId || body.user_id,
          question_id: body.questionId || body.question_id || 'q_answer',
          is_correct: Boolean(body.isCorrect),
          selected_answer: String(body.selectedAnswer || ''),
        }),
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch (_) {}
    return NextResponse.json({ success: true, data: { is_correct: body.isCorrect } });
  }

  // 2. If topic or document generation requested
  if (body?.topic || body?.document) {
    try {
      const endpoint = body.document
        ? `${BATTLE_SERVICE_URL}/api/questions/generate-from-document`
        : `${BATTLE_SERVICE_URL}/api/questions/generate-from-topic`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: body.topic || 'General Mathematics & Patterns',
          document: body.document || '',
          difficulty: body.difficulty || 'beginner',
          count: body.count || 10,
          user_id: body.userId || body.user_id,
        }),
        signal: AbortSignal.timeout(3000),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.data?.questions?.length > 0) {
          const questions = data.data.questions.map((q: any) => ({
            _id: q.id,
            category: q.mode || 'document',
            difficulty: q.difficulty,
            title: q.question?.slice(0, 80) || 'Question',
            description: q.question,
            options: q.options || [],
            correctAnswer: q.correct_answer,
            boilerplate: q.boilerplate || '',
            xpReward: q.xp || 50,
            pointsReward: q.coins ? q.coins * 10 : 100,
            timeLimit: q.time_limit || 60,
            explanation: q.explanation || '',
            hint: q.hint || '',
            tags: q.tags || [],
          }));
          return NextResponse.json({
            questions,
            source: data.data.source || 'python-engine',
            total: questions.length,
          });
        }
      }
    } catch (_) {}
  }

  // 3. Fallback to seeding full 530+ questions into DB
  await dbConnect();
  let seeded = 0;
  for (const [category, diffs] of Object.entries(ARENA_QUESTION_BANK)) {
    for (const [difficulty, qs] of Object.entries(diffs)) {
      for (const q of qs) {
        try {
          await ArenaQuestion.findOneAndUpdate(
            { title: q.title, category, difficulty },
            {
              ...q,
              category,
              difficulty,
              xpReward: XP_MAP[difficulty as ArenaDifficulty] || 50,
              pointsReward: POINTS_MAP[difficulty as ArenaDifficulty] || 100,
              timeLimit: TIME_MAP[difficulty as ArenaDifficulty] || 60,
            },
            { upsert: true }
          );
          seeded++;
        } catch (_) {}
      }
    }
  }
  return NextResponse.json({ success: true, seeded, totalInBank: 530 });
}
