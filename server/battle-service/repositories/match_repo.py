"""
Match Repository — MongoDB CRUD for matches collection.
"""

from typing import Optional
# pyrefly: ignore [missing-import]
from motor.motor_asyncio import AsyncIOMotorDatabase  # type: ignore

from models.match import MatchModel, MatchStatus
from utils.logger import get_logger

logger = get_logger(__name__)


class MatchRepository:
    """Repository for the 'matches' collection."""

    COLLECTION = "matches"

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._col = db[self.COLLECTION]

    async def ensure_indexes(self) -> None:
        await self._col.create_index([("match_id", 1)], unique=True)
        await self._col.create_index([("room_id", 1)])
        await self._col.create_index([("status", 1)])
        await self._col.create_index([("created_at", -1)])

    async def insert(self, match: MatchModel) -> None:
        await self._col.insert_one(match.to_mongo_dict())

    async def find_by_room(self, room_id: str) -> Optional[dict]:
        return await self._col.find_one({"room_id": room_id})

    async def find_by_player(self, player_id: str, limit: int = 20) -> list[dict]:
        cursor = (
            self._col.find({"participants.user_id": player_id})
            .sort("created_at", -1)
            .limit(limit)
        )
        docs = await cursor.to_list(length=limit)
        for d in docs:
            d.pop("_id", None)
        return docs

    async def update_status(self, match_id: str, status: MatchStatus) -> None:
        await self._col.update_one(
            {"match_id": match_id},
            {"$set": {"status": status.value}},
        )

    async def save_result(self, match: MatchModel) -> None:
        await self._col.update_one(
            {"match_id": match.match_id},
            {"$set": match.to_mongo_dict()},
            upsert=True,
        )
