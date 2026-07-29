"""
Unit tests for QuestionService hybrid resolution chain.

Uses a mock repository and cache to test fallback logic
without needing a live MongoDB or Redis connection.
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

from services.question_service import QuestionService
from services.cache_service import CacheService
from services.ai_service import AIService
from models.question import QuestionModel, GameMode, Difficulty, QuestionType
from utils.helpers import generate_id, utc_now


def make_question(mode="math", difficulty="beginner") -> QuestionModel:
    return QuestionModel(
        id=generate_id("test"),
        mode=GameMode(mode),
        difficulty=Difficulty(difficulty),
        topic="test",
        question="Test question?",
        question_type=QuestionType.MCQ,
        options=["A", "B", "C", "D"],
        correct_answer="A",
        explanation="Because A.",
        hint="Pick A.",
        time_limit=60,
        xp=50,
        coins=10,
        tags=["test"],
    )


@pytest.fixture
def mock_repo():
    repo = AsyncMock()
    repo.find_random.return_value = []
    repo.insert_many.return_value = 0
    repo.count.return_value = 0
    return repo


@pytest.fixture
def real_cache():
    return CacheService(ttl=60)


@pytest.fixture
def mock_ai():
    ai = AsyncMock(spec=AIService)
    ai.is_available = False
    ai.is_blocked_mode.return_value = False
    ai.generate_questions.return_value = []
    return ai


@pytest.fixture
def service(mock_repo, real_cache, mock_ai):
    return QuestionService(mock_repo, real_cache, mock_ai)


class TestQuestionServiceFallbackChain:
    """Test the 4-level resolution chain."""

    @pytest.mark.asyncio
    async def test_generator_fallback_when_db_empty(self, service, mock_repo):
        """When DB returns nothing and AI disabled, generator should supply questions."""
        mock_repo.find_random.return_value = []

        batch = await service.get_questions(
            mode="math",
            difficulty="beginner",
            limit=10,
        )

        assert len(batch.questions) == 10
        assert batch.source in ("generator", "ai+generator")
        for q in batch.questions:
            assert q.mode.value == "math"

    @pytest.mark.asyncio
    async def test_db_used_when_available(self, service, mock_repo):
        """When DB has enough questions, should return them."""
        db_questions = [make_question().to_mongo_dict() for _ in range(15)]
        mock_repo.find_random.return_value = db_questions

        batch = await service.get_questions(
            mode="math",
            difficulty="beginner",
            limit=10,
        )

        assert len(batch.questions) == 10
        assert batch.source == "db"

    @pytest.mark.asyncio
    async def test_cache_used_on_second_call(self, service, mock_repo):
        """Second call with same params should use cache."""
        db_questions = [make_question().to_mongo_dict() for _ in range(15)]
        mock_repo.find_random.return_value = db_questions

        # First call — hits DB
        batch1 = await service.get_questions(mode="math", difficulty="beginner", limit=10)

        # Reset DB mock to return nothing
        mock_repo.find_random.return_value = []

        # Second call — should hit cache
        batch2 = await service.get_questions(mode="math", difficulty="beginner", limit=10)

        assert batch2.source == "cache"
        assert len(batch2.questions) == 10

    @pytest.mark.asyncio
    async def test_prediction_uses_generator_never_ai(self, service, mock_ai):
        """Prediction mode must never call AI."""
        batch = await service.get_questions(
            mode="prediction",
            difficulty="beginner",
            limit=10,
        )
        assert len(batch.questions) == 10
        mock_ai.generate_questions.assert_not_called()

    @pytest.mark.asyncio
    async def test_no_duplicate_ids_in_batch(self, service):
        """Returned batch should never have duplicate question IDs."""
        batch = await service.get_questions(
            mode="gk",
            difficulty="intermediate",
            limit=20,
        )
        ids = [q.id for q in batch.questions]
        assert len(ids) == len(set(ids)), "Duplicate IDs in batch"

    @pytest.mark.asyncio
    async def test_limit_respected(self, service):
        """Should never return more questions than requested."""
        for limit in [5, 10, 20, 50]:
            batch = await service.get_questions(
                mode="coding",
                difficulty="beginner",
                limit=limit,
            )
            assert len(batch.questions) <= limit, f"Got {len(batch.questions)} but limit was {limit}"

    @pytest.mark.asyncio
    async def test_all_modes_return_questions(self, service):
        """All modes should produce questions."""
        modes = [m.value for m in GameMode]
        for mode in modes:
            batch = await service.get_questions(
                mode=mode,
                difficulty="beginner",
                limit=5,
            )
            assert len(batch.questions) > 0, f"No questions for mode: {mode}"
