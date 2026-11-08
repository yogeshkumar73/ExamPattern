"""
Question API Routes.

GET  /api/questions              — Paginated questions
GET  /api/questions/random       — Random questions (no duplicates)
GET  /api/questions/mode/{mode}  — Filter by mode
GET  /api/questions/difficulty/{difficulty} — Filter by difficulty
POST /api/questions/seed         — Admin: seed DB from generators
"""

from typing import Optional, Annotated
import uuid
import time
from fastapi import APIRouter, Depends, Query, Request, HTTPException, status

from middleware.rate_limiter import rate_limiter
from middleware.validation import (
    QuestionQueryParams,
    StartSessionRequest,
    AnswerSessionRequest,
    TopicQuestionRequest,
    DocumentQuestionRequest,
    AnswerQuestionRequest,
    BenchmarkRequest,
)
from models.question import GameMode, Difficulty, QuestionBatch
from services.metrics_service import telemetry
from utils.logger import get_logger
from utils.helpers import get_difficulty_for_level

logger = get_logger(__name__)

router = APIRouter(prefix="/api/questions", tags=["Questions"])


def _build_response(batch, extra: dict = {}) -> dict:
    return {
        "success": True,
        "data": {
            "questions": [q.model_dump() for q in batch.questions],
            "total": batch.total,
            "page": batch.page,
            "limit": batch.limit,
            "source": batch.source,
            **extra,
        },
    }


@router.get("")
async def get_questions(
    request: Request,
    mode: Optional[str] = Query(default=None),
    difficulty: Optional[str] = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    page: int = Query(default=1, ge=1),
    topic: Optional[str] = Query(default=None),
    exclude_ids: Optional[str] = Query(default=None),
):
    """
    Get paginated questions filtered by mode and/or difficulty.

    Supports:
    - ?mode=math&difficulty=beginner&limit=20&page=1
    - ?exclude_ids=id1,id2,id3  (deduplication)
    """
    await rate_limiter.check(request)

    # Validate params using Pydantic
    try:
        params = QuestionQueryParams(
            mode=mode, difficulty=difficulty, limit=limit,
            page=page, topic=topic, exclude_ids=exclude_ids,
        )
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))

    # Access question_service injected via app.state
    qs = request.app.state.question_service

    batch = await qs.get_questions(
        mode=params.mode or GameMode.MIXED.value,
        difficulty=params.difficulty or Difficulty.BEGINNER.value,
        limit=params.limit,
        page=params.page,
        topic=params.topic,
        exclude_ids=params.get_exclude_list(),
    )

    return _build_response(batch)


@router.get("/random")
async def get_random_questions(
    request: Request,
    mode: Optional[str] = Query(default=None),
    difficulty: Optional[str] = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    topic: Optional[str] = Query(default=None),
    document: Optional[str] = Query(default=None),
    exclude_ids: Optional[str] = Query(default=None),
    user_id: Optional[str] = Query(default=None),
):
    """
    Get completely random, freshly generated procedural questions.
    Generates new questions on every request using random, math, numpy, and pandas.
    Supports user topic/document input with sub-millisecond hot-buffer dispatch.
    """
    await rate_limiter.check(request)

    exclude = set(e.strip() for e in (exclude_ids or "").split(",") if e.strip())
    eff_mode = mode or "math"
    eff_diff = difficulty or "beginner"

    # Use HighThroughputQuestionEngine if available
    engine = getattr(request.app.state, "engine", None)
    if engine is not None:
        qs_list = await engine.get_fast_questions(
            mode=eff_mode,
            difficulty=eff_diff,
            count=limit,
            topic=topic,
            document=document,
            user_id=user_id,
            exclude_ids=exclude,
        )
        batch = QuestionBatch(
            questions=qs_list,
            total=len(qs_list),
            page=1,
            limit=limit,
            source="high_throughput_engine",
        )
        return _build_response(batch, {"topic": topic, "mode": eff_mode})

    qs = request.app.state.question_service
    batch = await qs.get_random(
        limit=limit,
        mode=eff_mode,
        difficulty=eff_diff,
        exclude_ids=list(exclude),
    )
    return _build_response(batch)


@router.post("/generate-from-topic")
async def generate_from_topic(request: Request, body: TopicQuestionRequest):
    """
    Generate questions directly tailored to user's custom topic
    using NumPy, random, and mathematical procedural engines.
    """
    await rate_limiter.check(request)
    engine = getattr(request.app.state, "engine", None)
    if engine is not None:
        qs = await engine.get_fast_questions(
            mode="custom",
            difficulty=body.difficulty or "beginner",
            count=body.count,
            topic=body.topic,
            user_id=body.user_id,
        )
    else:
        from generators.document_topic_generator import DocumentTopicGenerator
        from models.question import Difficulty
        gen = DocumentTopicGenerator()
        diff = Difficulty(body.difficulty.lower()) if body.difficulty else Difficulty.BEGINNER
        qs = gen.generate(difficulty=diff, count=body.count, topic=body.topic)

    batch = QuestionBatch(
        questions=qs,
        total=len(qs),
        page=1,
        limit=body.count,
        source="topic_generator",
    )
    return _build_response(batch, {"topic": body.topic})


@router.post("/generate-from-document")
async def generate_from_document(request: Request, body: DocumentQuestionRequest):
    """
    Extract patterns (trends, stats, correlations, term frequencies)
    from user document/dataset using Pandas & NumPy, then generate questions.
    """
    await rate_limiter.check(request)
    engine = getattr(request.app.state, "engine", None)
    if engine is not None:
        qs = await engine.get_fast_questions(
            mode="document",
            difficulty=body.difficulty or "beginner",
            count=body.count,
            topic=body.topic,
            document=body.document,
            user_id=body.user_id,
        )
    else:
        from generators.document_topic_generator import DocumentTopicGenerator
        from models.question import Difficulty
        gen = DocumentTopicGenerator()
        diff = Difficulty(body.difficulty.lower()) if body.difficulty else Difficulty.BEGINNER
        qs = gen.generate(
            difficulty=diff, count=body.count, topic=body.topic, document=body.document
        )

    batch = QuestionBatch(
        questions=qs,
        total=len(qs),
        page=1,
        limit=body.count,
        source="document_pattern_generator",
    )
    return _build_response(batch, {"topic": body.topic})


@router.post("/answer")
async def record_user_answer(request: Request, body: AnswerQuestionRequest):
    """
    Record user answer for live accuracy analytics in Grafana and frontend widgets.
    """
    telemetry.record_answer(body.is_correct)
    if body.user_id:
        telemetry.register_user(body.user_id)
    snapshot = telemetry.get_snapshot()
    return {
        "success": True,
        "data": {
            "is_correct": body.is_correct,
            "accuracy_rate_pct": snapshot["accuracy_rate_pct"],
            "total_answers": snapshot["total_answers"],
        },
    }


@router.get("/telemetry")
async def get_engine_telemetry(request: Request):
    """
    Real-time engine telemetry snapshot for Grafana and the frontend monitoring dashboard.
    """
    snapshot = telemetry.get_snapshot()
    return {
        "success": True,
        "data": snapshot,
    }


@router.post("/benchmark")
async def run_throughput_benchmark(request: Request, body: BenchmarkRequest):
    """
    Stress-test the queue and multi-threaded engine with N requests
    to verify capacity to handle 1,000 requests/second.
    """
    import asyncio
    engine = getattr(request.app.state, "engine", None)
    if engine is None:
        raise HTTPException(status_code=500, detail="Engine not initialized")

    start_bench = time.time()
    n = body.num_requests
    concurrency = body.concurrency
    sem = asyncio.Semaphore(concurrency)

    async def _task():
        async with sem:
            return await engine.get_fast_questions(
                mode="math", difficulty="beginner", count=2
            )

    results = await asyncio.gather(*[_task() for _ in range(n)])
    elapsed = max(0.001, time.time() - start_bench)
    qps = round(n / elapsed, 1)

    return {
        "success": True,
        "data": {
            "total_requests": n,
            "concurrency": concurrency,
            "elapsed_seconds": round(elapsed, 3),
            "achieved_qps": qps,
            "target_qps": 1000,
            "meets_1000_qps_target": qps >= 1000,
            "sample_questions_retrieved": len(results),
        },
    }



@router.get("/mode/{mode}")
async def get_by_mode(
    request: Request,
    mode: str,
    difficulty: Optional[str] = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    page: int = Query(default=1, ge=1),
):
    """Get questions filtered by mode."""
    await rate_limiter.check(request)

    valid_modes = [m.value for m in GameMode]
    if mode not in valid_modes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid mode. Must be one of: {valid_modes}",
        )

    qs = request.app.state.question_service
    batch = await qs.get_questions(
        mode=mode,
        difficulty=difficulty or Difficulty.BEGINNER.value,
        limit=limit,
        page=page,
    )

    return _build_response(batch, {"mode": mode})


@router.get("/difficulty/{difficulty}")
async def get_by_difficulty(
    request: Request,
    difficulty: str,
    mode: Optional[str] = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    page: int = Query(default=1, ge=1),
):
    """Get questions filtered by difficulty."""
    await rate_limiter.check(request)

    valid_diffs = [d.value for d in Difficulty]
    if difficulty not in valid_diffs:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid difficulty. Must be one of: {valid_diffs}",
        )

    qs = request.app.state.question_service
    batch = await qs.get_questions(
        mode=mode or GameMode.MIXED.value,
        difficulty=difficulty,
        limit=limit,
        page=page,
    )

    return _build_response(batch, {"difficulty": difficulty})


@router.post("/seed")
async def seed_questions(request: Request):
    """
    Admin: Seed MongoDB with questions from all Python generators.

    This populates the DB on first run so subsequent requests
    hit MongoDB instead of generators.
    """
    qs = request.app.state.question_service
    total = await qs.seed_from_generators(count_per_combo=15)
    return {
        "success": True,
        "message": f"Seeded {total} questions across all modes and difficulties.",
        "total": total,
    }


@router.post("/session/start")
async def start_quiz_session(request: Request, body: StartSessionRequest):
    """
    Start an independent quiz session for a user.
    Difficulty is determined automatically based on the user's level.
    """
    await rate_limiter.check(request)

    player_repo = request.app.state.player_repo
    qs = request.app.state.question_service
    cache = request.app.state.cache

    # 1. Fetch user level (default to 1 if not found)
    level = 1
    try:
        player_stats = await player_repo.find_by_id(body.user_id)
        if player_stats:
            level = player_stats.level or player_stats.compute_level()
    except Exception as exc:
        logger.warning("Failed to fetch player stats for %s: %s", body.user_id, exc)

    # 2. Determine difficulty automatically
    difficulty = get_difficulty_for_level(level)

    # 3. Generate exactly 20 random, unique questions
    batch = await qs.get_session_questions(
        mode=body.mode,
        difficulty=difficulty,
        limit=20,
        topic=body.topic,
        user_level=level,
    )

    # 4. Initialize session cache metadata
    session_id = uuid.uuid4().hex[:12]
    used_question_ids = [q.id for q in batch.questions]
    expires_in = 3600  # 1 hour TTL
    expires_at = int(time.time()) + expires_in

    session_data = {
        "session_id": session_id,
        "user_id": body.user_id,
        "mode": body.mode,
        "difficulty": difficulty,
        "current_question": 1,
        "score": 0,
        "answered_questions": [],
        "used_question_ids": used_question_ids,
        "expires_at": expires_at,
    }

    # Cache metadata only, not full question objects
    cache_key = f"quiz:{body.user_id}:{session_id}"
    await cache.set(cache_key, session_data, ttl=expires_in)

    # Return questions and session info
    return {
        "success": True,
        "data": {
            "session": session_data,
            "questions": [q.model_dump() for q in batch.questions],
        }
    }


@router.post("/session/answer")
async def submit_session_answer(request: Request, body: AnswerSessionRequest):
    """
    Submit an answer for the current question in a session.
    Increments score if correct, updates answered_questions, and increments current_question.
    Automatically deletes cache if the quiz is finished.
    """
    await rate_limiter.check(request)

    cache = request.app.state.cache

    cache_key = f"quiz:{body.user_id}:{body.session_id}"
    session_data = await cache.get(cache_key)

    if not session_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz session not found or expired.",
        )

    current_q_idx = session_data["current_question"]  # 1-indexed
    if current_q_idx > 20:
        await cache.invalidate(cache_key)
        return {
            "success": True,
            "data": {
                "finished": True,
                "score": session_data["score"],
            }
        }

    used_ids = session_data["used_question_ids"]
    if current_q_idx - 1 >= len(used_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current question index exceeds generated questions count.",
        )

    question_id = used_ids[current_q_idx - 1]

    if question_id != body.question_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid question ID. Expected {question_id}.",
        )

    question_repo = request.app.state.question_service._repo
    question_doc = await question_repo.find_by_id(question_id)
    if not question_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found in DB.",
        )

    correct_answer = question_doc.get("correct_answer")
    explanation = question_doc.get("explanation", "")
    is_correct = str(body.answer).strip().lower() == str(correct_answer).strip().lower()

    if is_correct:
        session_data["score"] += 1

    session_data["answered_questions"].append({
        "question_id": question_id,
        "user_answer": body.answer,
        "correct_answer": correct_answer,
        "is_correct": is_correct
    })

    session_data["current_question"] += 1
    finished = session_data["current_question"] > 20

    if finished:
        await cache.invalidate(cache_key)
    else:
        ttl = max(10, int(session_data["expires_at"] - time.time()))
        await cache.set(cache_key, session_data, ttl=ttl)

    return {
        "success": True,
        "data": {
            "correct": is_correct,
            "correct_answer": correct_answer,
            "explanation": explanation,
            "score": session_data["score"],
            "current_question": session_data["current_question"],
            "finished": finished,
        }
    }
