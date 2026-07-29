"""
Player Stats Repository — MongoDB CRUD for player_stats collection.
"""

from typing import Optional
from motor.motor_asyncio import AsyncIOMotorDatabase

from models.player import PlayerStats
from utils.logger import get_logger

logger = get_logger(__name__)


class PlayerRepository:
    """Repository for the 'player_stats' collection."""

    COLLECTION = "player_stats"

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._col = db[self.COLLECTION]

    async def ensure_indexes(self) -> None:
        await self._col.create_index([("player_id", 1)], unique=True)
        await self._col.create_index([("elo", -1)])
        await self._col.create_index([("xp", -1)])

    async def find_by_id(self, player_id: str) -> Optional[PlayerStats]:
        doc = await self._col.find_one({"player_id": player_id})
        if doc:
            doc.pop("_id", None)
            return PlayerStats(**doc)
        return None

    async def upsert(self, stats: PlayerStats) -> None:
        """Create or update player stats."""
        data = stats.to_mongo_dict()
        await self._col.update_one(
            {"player_id": stats.player_id},
            {"$set": data},
            upsert=True,
        )
        logger.debug("Upserted stats for player %s", stats.player_id)

    async def find_top(self, limit: int = 50, sort_field: str = "elo") -> list[dict]:
        """Retrieve top players sorted by field descending."""
        cursor = self._col.find({}).sort(sort_field, -1).limit(limit)
        docs = await cursor.to_list(length=limit)
        for d in docs:
            d.pop("_id", None)
        return docs

    async def find_top_by_mode(self, mode: str, limit: int = 50) -> list[dict]:
        """Top players in a specific mode sorted by mode XP."""
        sort_key = f"mode_stats.{mode}.xp"
        cursor = self._col.find({sort_key: {"$exists": True}}).sort(sort_key, -1).limit(limit)
        docs = await cursor.to_list(length=limit)
        for d in docs:
            d.pop("_id", None)
        return docs
