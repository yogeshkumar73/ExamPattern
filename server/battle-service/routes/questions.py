"""
Question API Routes.

GET  /api/questions              — Paginated questions
GET  /api/questions/random       — Random questions (no duplicates)
GET  /api/questions/mode/{mode}  — Filter by mode
GET  /api/questions/difficulty/{difficulty} — Filter by difficulty
POST /api/questions/seed         — Admin: seed DB from generators
"""

from typing import Optional, Annotated
from fastapi import APIRouter, Depends, Query, Request, HTTPException, status

from middleware.rate_limiter import rate_limiter
from middleware.validation import QuestionQueryParams
from models.question import GameMode, Difficulty
from utils.logger import get_logger

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
    exclude_ids: Optional[str] = Query(default=None),
):
    """
    Get completely random questions.

    If mode/difficulty not specified, randomly selects them.
    """
    await rate_limiter.check(request)

    exclude = [e.strip() for e in (exclude_ids or "").split(",") if e.strip()]

    qs = request.app.state.question_service
    batch = await qs.get_random(
        limit=limit,
        mode=mode,
        difficulty=difficulty,
        exclude_ids=exclude,
    )

    return _build_response(batch)


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
