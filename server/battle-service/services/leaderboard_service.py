"""
Leaderboard Service — ELO calculation, rank tracking, stat updates.
"""

import math
from typing import Optional

from config import settings
from models.leaderboard import (
    LeaderboardEntry,
    LeaderboardResponse,
    RankTier,
    compute_rank,
    compute_elo_change,
)
from models.player import PlayerStats
from repositories.player_repo import PlayerRepository
from repositories.leaderboard_repo import LeaderboardRepository
from services.cache_service import CacheService
from utils.logger import get_logger

logger = get_logger(__name__)

_LEADERBOARD_CACHE_TTL = 120  # 2 minutes for leaderboard data


class LeaderboardService:
    """
    Handles ELO ratings, rank computation, XP/coin tracking,
    and leaderboard queries with caching.
    """

    def __init__(
        self,
        player_repo: PlayerRepository,
        lb_repo: LeaderboardRepository,
        cache: CacheService,
    ) -> None:
        self._player_repo = player_repo
        self._lb_repo = lb_repo
        self._cache = cache

    async def record_battle_result(
        self,
        player_id: str,
        player_name: str,
        opponent_id: Optional[str],
        won: bool,
        mode: str,
        difficulty: str,
        correct_answers: int,
        total_questions: int,
        xp_earned: int,
        coins_earned: int,
    ) -> PlayerStats:
        """
        Update player stats after a battle.

        Returns updated PlayerStats.
        """
        # Load or create stats
        stats = await self._player_repo.find_by_id(player_id)
        if not stats:
            stats = PlayerStats(player_id=player_id, name=player_name)

        # Load opponent ELO for ELO calculation
        opponent_elo = settings.ELO_STARTING_RATING
        if opponent_id:
            opp_stats = await self._player_repo.find_by_id(opponent_id)
            if opp_stats:
                opponent_elo = opp_stats.elo

        # ── ELO update ────────────────────────────────────────
        elo_change = compute_elo_change(
            player_elo=stats.elo,
            opponent_elo=opponent_elo,
            won=won,
            k_factor=settings.ELO_K_FACTOR,
        )
        stats.elo = max(0, stats.elo + elo_change)

        # ── Battle record ─────────────────────────────────────
        stats.total_battles += 1
        if won:
            stats.wins += 1
            stats.current_streak += 1
            stats.best_streak = max(stats.best_streak, stats.current_streak)
        else:
            stats.losses += 1
            stats.current_streak = 0

        stats.win_rate = stats.compute_win_rate()

        # ── XP / Coins ────────────────────────────────────────
        stats.xp += xp_earned
        stats.coins += coins_earned
        stats.level = stats.compute_level()

        # ── Accuracy ──────────────────────────────────────────
        stats.total_correct += correct_answers
        stats.total_attempted += total_questions
        stats.accuracy = stats.compute_accuracy()

        # ── Per-mode stats ────────────────────────────────────
        if mode not in stats.mode_stats:
            stats.mode_stats[mode] = {"wins": 0, "losses": 0, "xp": 0}
        stats.mode_stats[mode]["xp"] = stats.mode_stats[mode].get("xp", 0) + xp_earned
        if won:
            stats.mode_stats[mode]["wins"] = stats.mode_stats[mode].get("wins", 0) + 1
        else:
            stats.mode_stats[mode]["losses"] = stats.mode_stats[mode].get("losses", 0) + 1

        # Persist
        await self._player_repo.upsert(stats)

        # Invalidate leaderboard caches
        await self._cache.invalidate(CacheService.make_key("leaderboard", category="global"))
        await self._cache.invalidate(CacheService.make_key("leaderboard", category=mode))

        logger.info(
            "Battle recorded: player=%s won=%s elo_change=%+d new_elo=%d",
            player_id, won, elo_change, stats.elo,
        )
        return stats

    async def get_leaderboard(
        self,
        category: str = "global",
        limit: int = 50,
        page: int = 1,
    ) -> LeaderboardResponse:
        """
        Return paginated leaderboard with caching.

        Args:
            category: 'global', or a mode name like 'math', 'coding'.
        """
        cache_key = CacheService.make_key("leaderboard", category=category, page=page, limit=limit)
        cached = await self._cache.get(cache_key)
        if cached:
            return LeaderboardResponse(**cached)

        skip = (page - 1) * limit
        total = await self._lb_repo.get_total_players()

        if category == "global":
            docs = await self._lb_repo.get_global_leaderboard(limit=limit, skip=skip)
        else:
            docs = await self._lb_repo.get_mode_leaderboard(mode=category, limit=limit, skip=skip)

        entries = []
        for rank_idx, doc in enumerate(docs, start=skip + 1):
            elo = doc.get("elo", settings.ELO_STARTING_RATING)
            entry = LeaderboardEntry(
                rank=rank_idx,
                player_id=doc.get("player_id", ""),
                name=doc.get("name", "Unknown"),
                avatar=doc.get("avatar", ""),
                elo=elo,
                rank_tier=compute_rank(elo),
                xp=doc.get("xp", 0),
                coins=doc.get("coins", 0),
                level=doc.get("level", 1),
                wins=doc.get("wins", 0),
                losses=doc.get("losses", 0),
                win_rate=doc.get("win_rate", 0.0),
                accuracy=doc.get("accuracy", 0.0),
                total_correct=doc.get("total_correct", 0),
                current_streak=doc.get("current_streak", 0),
                best_streak=doc.get("best_streak", 0),
                total_battles=doc.get("total_battles", 0),
                mode_filter=category if category != "global" else None,
            )
            entries.append(entry)

        response = LeaderboardResponse(
            entries=entries,
            total=total,
            category=category,
            page=page,
            limit=limit,
        )
        await self._cache.set(cache_key, response.model_dump(), ttl=_LEADERBOARD_CACHE_TTL)
        return response

    async def get_player_stats(self, player_id: str) -> Optional[PlayerStats]:
        """Fetch a player's full stats."""
        return await self._player_repo.find_by_id(player_id)

    async def get_player_rank(self, player_id: str) -> int:
        """Return global ELO rank of a player."""
        return await self._lb_repo.get_player_rank(player_id)
