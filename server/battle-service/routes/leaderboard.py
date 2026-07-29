"""
Leaderboard API Routes.

GET  /api/leaderboard             — Global leaderboard (ELO sorted)
GET  /api/leaderboard/mode/{mode} — Per-mode leaderboard (XP sorted)
GET  /api/leaderboard/player/{id} — Player stats + rank
POST /api/leaderboard/result      — Record battle result, update ELO
"""

from typing import Optional
from fastapi import APIRouter, Request, HTTPException, status, Query

from middleware.rate_limiter import rate_limiter
from middleware.validation import BattleResultRequest
from utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/api/leaderboard", tags=["Leaderboard"])


@router.get("")
async def get_global_leaderboard(
    request: Request,
    limit: int = Query(default=50, ge=1, le=100),
    page: int = Query(default=1, ge=1),
):
    """
    Global leaderboard sorted by ELO descending.

    Returns entries with: rank, name, elo, rank_tier, xp, wins, win_rate,
    accuracy, streak, level.
    """
    await rate_limiter.check(request)

    lb_service = request.app.state.leaderboard_service
    response = await lb_service.get_leaderboard(category="global", limit=limit, page=page)

    return {
        "success": True,
        "data": response.model_dump(),
    }


@router.get("/mode/{mode}")
async def get_mode_leaderboard(
    request: Request,
    mode: str,
    limit: int = Query(default=50, ge=1, le=100),
    page: int = Query(default=1, ge=1),
):
    """Per-mode leaderboard sorted by mode XP descending."""
    await rate_limiter.check(request)

    lb_service = request.app.state.leaderboard_service
    response = await lb_service.get_leaderboard(category=mode, limit=limit, page=page)

    return {
        "success": True,
        "data": response.model_dump(),
    }


@router.get("/player/{player_id}")
async def get_player_stats(request: Request, player_id: str):
    """
    Get full player statistics including ELO, rank, streaks,
    per-mode breakdown, and global rank position.
    """
    await rate_limiter.check(request)

    lb_service = request.app.state.leaderboard_service
    stats = await lb_service.get_player_stats(player_id)

    if not stats:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Player {player_id} not found.",
        )

    rank = await lb_service.get_player_rank(player_id)

    return {
        "success": True,
        "data": {
            **stats.model_dump(),
            "global_rank": rank,
        },
    }


@router.post("/result")
async def record_battle_result(request: Request, body: BattleResultRequest):
    """
    Record a battle result and update ELO, XP, coins, streaks.

    Called by Next.js after a match finishes via the battle API route.
    """
    await rate_limiter.check(request)

    lb_service = request.app.state.leaderboard_service

    try:
        updated_stats = await lb_service.record_battle_result(
            player_id=body.player_id,
            player_name=body.player_name,
            opponent_id=body.opponent_id,
            won=body.won,
            mode=body.mode,
            difficulty=body.difficulty,
            correct_answers=body.correct_answers,
            total_questions=body.total_questions,
            xp_earned=body.xp_earned,
            coins_earned=body.coins_earned,
        )
    except Exception as exc:
        logger.error("Failed to record battle result: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update player stats.",
        )

    return {
        "success": True,
        "data": {
            "player_id": body.player_id,
            "new_elo": updated_stats.elo,
            "new_xp": updated_stats.xp,
            "new_coins": updated_stats.coins,
            "new_level": updated_stats.level,
            "new_streak": updated_stats.current_streak,
            "win_rate": updated_stats.win_rate,
            "accuracy": updated_stats.accuracy,
        },
    }
