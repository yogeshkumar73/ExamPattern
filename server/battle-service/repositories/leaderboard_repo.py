"""
Leaderboard Repository — MongoDB CRUD for leaderboard collection.
"""

from motor.motor_asyncio import AsyncIOMotorDatabase
from utils.logger import get_logger

logger = get_logger(__name__)


class LeaderboardRepository:
    """Repository for aggregating and caching leaderboard data."""

    COLLECTION = "player_stats"

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._col = db[self.COLLECTION]

    async def get_global_leaderboard(self, limit: int = 50, skip: int = 0) -> list[dict]:
        """Top players globally sorted by ELO descending."""
        pipeline = [
            {"$sort": {"elo": -1}},
            {"$skip": skip},
            {"$limit": limit},
            {"$project": {"_id": 0}},
        ]
        return await self._col.aggregate(pipeline).to_list(length=limit)

    async def get_mode_leaderboard(
        self, mode: str, limit: int = 50, skip: int = 0
    ) -> list[dict]:
        """Top players in a specific mode sorted by mode XP."""
        sort_key = f"mode_stats.{mode}.xp"
        pipeline = [
            {"$match": {sort_key: {"$exists": True, "$gt": 0}}},
            {"$sort": {sort_key: -1}},
            {"$skip": skip},
            {"$limit": limit},
            {"$project": {"_id": 0}},
        ]
        return await self._col.aggregate(pipeline).to_list(length=limit)

    async def get_player_rank(self, player_id: str) -> int:
        """Return the global ELO rank of a player (1-indexed)."""
        player = await self._col.find_one({"player_id": player_id})
        if not player:
            return -1
        elo = player.get("elo", 1200)
        rank = await self._col.count_documents({"elo": {"$gt": elo}})
        return rank + 1

    async def get_total_players(self) -> int:
        return await self._col.count_documents({})
