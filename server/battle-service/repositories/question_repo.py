"""
Question Repository — MongoDB CRUD for questions collection.

Uses aggregation pipelines for efficient random sampling,
deduplication via $nin, and batch inserts.
"""

from typing import Optional
from motor.motor_asyncio import AsyncIOMotorDatabase

from models.question import QuestionModel
from utils.logger import get_logger

logger = get_logger(__name__)


class QuestionRepository:
    """
    Repository pattern for the 'questions' MongoDB collection.

    All queries are async. Indexes are created on first use.
    """

    COLLECTION = "questions"

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._col = db[self.COLLECTION]

    async def ensure_indexes(self) -> None:
        """Create indexes if they don't already exist."""
        await self._col.create_index([("mode", 1), ("difficulty", 1)])
        await self._col.create_index([("tags", 1)])
        await self._col.create_index([("created_at", -1)])
        await self._col.create_index([("id", 1)], unique=True)
        logger.info("Question collection indexes ensured.")

    async def count(self, mode: str, difficulty: str) -> int:
        """Count questions matching mode + difficulty."""
        return await self._col.count_documents({"mode": mode, "difficulty": difficulty})

    async def find_random(
        self,
        mode: str,
        difficulty: str,
        limit: int,
        exclude_ids: Optional[list[str]] = None,
    ) -> list[dict]:
        """
        Fetch `limit` random questions via $sample aggregation.

        Args:
            mode: Game mode filter.
            difficulty: Difficulty filter.
            limit: Number of questions to return.
            exclude_ids: Question IDs to exclude ($nin filter).

        Returns:
            List of raw MongoDB documents.
        """
        match_filter: dict = {"mode": mode, "difficulty": difficulty}
        if exclude_ids:
            match_filter["id"] = {"$nin": exclude_ids}

        pipeline = [
            {"$match": match_filter},
            {"$sample": {"size": limit}},
        ]

        try:
            docs = await self._col.aggregate(pipeline).to_list(length=limit)
            return docs
        except Exception as exc:
            logger.error("find_random failed: %s", exc)
            return []

    async def find_by_id(self, question_id: str) -> Optional[dict]:
        """Find a single question by its ID."""
        return await self._col.find_one({"id": question_id})

    async def insert_many(self, questions: list[QuestionModel]) -> int:
        """
        Bulk insert questions, skipping duplicates.

        Returns the number of newly inserted questions.
        """
        if not questions:
            return 0

        docs = [q.to_mongo_dict() for q in questions]
        inserted = 0

        for doc in docs:
            try:
                await self._col.update_one(
                    {"id": doc["id"]},
                    {"$setOnInsert": doc},
                    upsert=True,
                )
                inserted += 1
            except Exception as exc:
                logger.warning("Skipping duplicate question %s: %s", doc.get("id"), exc)

        logger.info("Inserted %d questions into MongoDB.", inserted)
        return inserted

    async def find_by_mode(self, mode: str, limit: int = 50) -> list[dict]:
        """Find questions filtered only by mode."""
        return await self._col.find({"mode": mode}).limit(limit).to_list(length=limit)

    async def find_by_difficulty(self, difficulty: str, limit: int = 50) -> list[dict]:
        """Find questions filtered only by difficulty."""
        return await self._col.find({"difficulty": difficulty}).limit(limit).to_list(length=limit)

    async def find_paginated(
        self,
        mode: Optional[str],
        difficulty: Optional[str],
        page: int,
        limit: int,
        exclude_ids: Optional[list[str]] = None,
    ) -> tuple[list[dict], int]:
        """
        Return paginated questions and total count.

        Returns:
            Tuple of (documents, total_count).
        """
        filt: dict = {}
        if mode:
            filt["mode"] = mode
        if difficulty:
            filt["difficulty"] = difficulty
        if exclude_ids:
            filt["id"] = {"$nin": exclude_ids}

        total = await self._col.count_documents(filt)
        skip = (page - 1) * limit
        docs = (
            await self._col.find(filt)
            .skip(skip)
            .limit(limit)
            .to_list(length=limit)
        )
        return docs, total
