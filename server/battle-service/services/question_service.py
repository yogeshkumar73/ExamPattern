"""
Question Service — Hybrid Question Engine (Core).

Resolution chain:
  1. Cache (10 min TTL)
  2. MongoDB ($sample aggregation)
  3. AI Generation (if enabled & not prediction mode)
  4. Python Generator (always available, unlimited)

Prediction mode ALWAYS uses PredictionGenerator (zero AI).
All other modes prefer DB → AI → Generator.
"""

import random
from typing import Optional

from config import settings
from generators.math_generator import MathGenerator
from generators.gk_generator import GKGenerator
from generators.coding_generator import CodingGenerator
from generators.puzzle_generator import PuzzleGenerator
from generators.prediction_generator import PredictionGenerator
from generators.random_generator import RandomGenerator
from models.question import QuestionModel, QuestionBatch, GameMode, Difficulty
from repositories.question_repo import QuestionRepository
from services.cache_service import CacheService
from services.ai_service import AIService
from utils.helpers import shuffle_options_with_answer, deduplicate_by_id
from utils.logger import get_logger

logger = get_logger(__name__)

# Generator registry keyed by mode value
_GENERATORS: dict[str, object] = {
    GameMode.MATH.value: MathGenerator(),
    GameMode.GK.value: GKGenerator(),
    GameMode.CODING.value: CodingGenerator(),
    GameMode.PUZZLE.value: PuzzleGenerator(),
    GameMode.PREDICTION.value: PredictionGenerator(),
    GameMode.MIXED.value: RandomGenerator(),
}


class QuestionService:
    """
    Hybrid Question Engine.

    Combines MongoDB static bank, AI generation, and pure Python generators
    into a single unified interface. Callers don't need to know which source
    provided the questions.
    """

    def __init__(
        self,
        question_repo: QuestionRepository,
        cache: CacheService,
        ai_service: AIService,
    ) -> None:
        self._repo = question_repo
        self._cache = cache
        self._ai = ai_service

    async def get_questions(
        self,
        mode: str,
        difficulty: str,
        limit: int = 20,
        page: int = 1,
        topic: Optional[str] = None,
        exclude_ids: Optional[list[str]] = None,
    ) -> QuestionBatch:
        """
        Fetch `limit` questions for the given mode/difficulty.

        Resolution chain:
        1. Check cache
        2. Query MongoDB
        3. AI generation (if enabled, mode != prediction)
        4. Python generator (always last resort)

        Returns QuestionBatch with source label for debugging.
        """
        limit = min(limit, settings.MAX_QUESTION_LIMIT)
        exclude = set(exclude_ids or [])

        # ── 1. Cache lookup ───────────────────────────────────
        cache_key = CacheService.make_key(
            "questions", mode=mode, difficulty=difficulty, limit=limit, page=page
        )
        cached = await self._cache.get(cache_key)
        if cached:
            logger.debug("Cache hit: %s", cache_key)
            questions = [QuestionModel(**q) for q in cached]
            questions = [q for q in questions if q.id not in exclude]
            if len(questions) >= limit:
                return QuestionBatch(
                    questions=questions[:limit],
                    total=len(questions),
                    page=page,
                    limit=limit,
                    source="cache",
                )

        # ── 2. MongoDB lookup ─────────────────────────────────
        db_docs = []
        try:
            db_docs = await self._repo.find_random(
                mode=mode,
                difficulty=difficulty,
                limit=limit,
                exclude_ids=list(exclude),
            )
        except Exception as exc:
            logger.warning("MongoDB query failed: %s", exc)

        if db_docs:
            questions = self._docs_to_models(db_docs)
            questions = self._shuffle_answers(questions)
            if len(questions) >= limit:
                await self._cache.set(cache_key, [q.model_dump() for q in questions])
                return QuestionBatch(
                    questions=questions[:limit],
                    total=len(questions),
                    page=page,
                    limit=limit,
                    source="db",
                )

        # ── 3. AI generation (if enabled, not prediction) ─────
        ai_questions: list[QuestionModel] = []
        if self._ai.is_available and mode != GameMode.PREDICTION.value:
            ai_questions = await self._ai.generate_questions(
                mode=mode, difficulty=difficulty, count=limit, topic=topic
            )
            if ai_questions:
                # Save AI questions to MongoDB for future reuse
                saved = await self._repo.insert_many(ai_questions)
                logger.info("Saved %d AI questions to MongoDB.", saved)

        # Merge DB + AI
        all_questions = self._merge_and_dedupe(db_docs, ai_questions, exclude)
        if len(all_questions) >= limit:
            await self._cache.set(cache_key, [q.model_dump() for q in all_questions])
            return QuestionBatch(
                questions=all_questions[:limit],
                total=len(all_questions),
                page=page,
                limit=limit,
                source="ai",
            )

        # ── 4. Python generator (always works, unlimited) ─────
        needed = limit - len(all_questions)
        gen_exclude = exclude | {q.id for q in all_questions}

        try:
            diff_enum = Difficulty(difficulty)
        except ValueError:
            diff_enum = Difficulty.BEGINNER

        generator = _GENERATORS.get(mode, _GENERATORS[GameMode.MIXED.value])
        gen_questions = generator.generate(  # type: ignore[union-attr]
            difficulty=diff_enum,
            count=needed,
            topic=topic,
            exclude_ids=gen_exclude,
        )

        all_questions = all_questions + gen_questions
        random.shuffle(all_questions)

        # Cache the result
        await self._cache.set(cache_key, [q.model_dump() for q in all_questions])

        source = "generator" if not ai_questions else "ai+generator"
        return QuestionBatch(
            questions=all_questions[:limit],
            total=len(all_questions),
            page=page,
            limit=limit,
            source=source,
        )

    async def get_session_questions(
        self,
        mode: str,
        difficulty: str,
        limit: int = 20,
        topic: Optional[str] = None,
        exclude_ids: Optional[list[str]] = None,
        user_level: Optional[int] = None,
    ) -> QuestionBatch:
        """
        Fetch exactly `limit` fresh, random, unique questions for a user session.

        Flow:
        1. MongoDB random sample of a larger pool (100) -> filter exclude_ids -> shuffle.
        2. AI generation if needed.
        3. Python generator if needed.
        Returns exactly `limit` questions.
        """
        exclude = set(exclude_ids or [])
        questions: list[QuestionModel] = []
        source_label = "db"

        # 1. MongoDB Random Sample (larger pool: 100)
        try:
            db_docs = await self._repo.find_random(
                mode=mode,
                difficulty=difficulty,
                limit=100,
                exclude_ids=list(exclude),
            )
            if db_docs:
                db_questions = self._docs_to_models(db_docs)
                db_questions = self._shuffle_answers(db_questions)
                for q in db_questions:
                    if q.id not in exclude:
                        questions.append(q)
                        exclude.add(q.id)
                random.shuffle(questions)
        except Exception as exc:
            logger.warning("MongoDB random sample failed: %s", exc)

        # 2. AI Generation if needed
        if len(questions) < limit and self._ai.is_available and mode != GameMode.PREDICTION.value:
            needed = limit - len(questions)
            previous_generated = [q.question for q in questions]
            ai_questions = await self._ai.generate_questions(
                mode=mode,
                difficulty=difficulty,
                count=needed,
                topic=topic,
                user_level=user_level,
                previously_used_ids=list(exclude),
                previous_generated_questions=previous_generated,
            )
            if ai_questions:
                await self._repo.insert_many(ai_questions)
                for q in ai_questions:
                    if q.id not in exclude:
                        questions.append(q)
                        exclude.add(q.id)
                source_label += "+ai"

        # 3. Python Generator if needed
        if len(questions) < limit:
            needed = limit - len(questions)
            try:
                diff_enum = Difficulty(difficulty)
            except ValueError:
                diff_enum = Difficulty.BEGINNER

            generator = _GENERATORS.get(mode, _GENERATORS[GameMode.MIXED.value])
            gen_questions = generator.generate(
                difficulty=diff_enum,
                count=needed,
                topic=topic,
                exclude_ids=exclude,
            )
            if gen_questions:
                # We don't save to DB here because pure generative modes are infinite and one-offs
                # await self._repo.insert_many(gen_questions)
                for q in gen_questions:
                    if q.id not in exclude:
                        questions.append(q)
                        exclude.add(q.id)
            source_label += "+generator"
            
        # 4. Ultimate Fallback (guarantee limit for unlimited loops)
        # If we STILL don't have enough questions (e.g. GK ran out of unique combos)
        # Force fallback to pure algorithmic Math/Prediction generators
        if len(questions) < limit:
            needed = limit - len(questions)
            fallback_gen = random.choice([MathGenerator(), PredictionGenerator()])
            try:
                diff_enum = Difficulty(difficulty)
            except ValueError:
                diff_enum = Difficulty.BEGINNER
                
            fallback_questions = fallback_gen.generate(
                difficulty=diff_enum, 
                count=needed, 
                topic=None, 
                exclude_ids=exclude
            )
            for q in fallback_questions:
                if q.id not in exclude:
                    questions.append(q)
                    exclude.add(q.id)
            source_label += "+algorithmic_fallback"

        # Shuffle the final batch
        random.shuffle(questions)
        final_questions = questions[:limit]

        return QuestionBatch(
            questions=final_questions,
            total=len(final_questions),
            page=1,
            limit=limit,
            source=source_label,
        )
    async def get_random(
        self,
        limit: int = 20,
        mode: Optional[str] = None,
        difficulty: Optional[str] = None,
        exclude_ids: Optional[list[str]] = None,
    ) -> QuestionBatch:
        """Return completely random questions across modes/difficulties."""
        mode = mode or random.choice([m.value for m in GameMode if m != GameMode.MIXED])
        difficulty = difficulty or random.choice([d.value for d in Difficulty])
        return await self.get_questions(
            mode=mode,
            difficulty=difficulty,
            limit=limit,
            exclude_ids=exclude_ids,
        )

    async def seed_from_generators(self, count_per_combo: int = 10) -> int:
        """
        Seed the MongoDB question collection from all Python generators.
        Called on first startup or via admin endpoint.
        """
        total_inserted = 0
        modes = [m.value for m in GameMode if m != GameMode.MIXED]
        difficulties = [d for d in Difficulty]

        for mode in modes:
            generator = _GENERATORS.get(mode)
            if not generator:
                continue
            for diff in difficulties:
                questions = generator.generate(  # type: ignore[union-attr]
                    difficulty=diff,
                    count=count_per_combo,
                )
                inserted = await self._repo.insert_many(questions)
                total_inserted += inserted
                logger.info("Seeded %d questions for mode=%s difficulty=%s", inserted, mode, diff.value)

        return total_inserted

    # ── Private helpers ───────────────────────────────────────

    def _docs_to_models(self, docs: list[dict]) -> list[QuestionModel]:
        models = []
        for doc in docs:
            doc.pop("_id", None)
            try:
                models.append(QuestionModel(**doc))
            except Exception as exc:
                logger.warning("Failed to parse question doc: %s", exc)
        return models

    def _shuffle_answers(self, questions: list[QuestionModel]) -> list[QuestionModel]:
        """Shuffle MCQ options while keeping correct_answer consistent."""
        result = []
        for q in questions:
            if q.options and q.correct_answer:
                shuffled, ans = shuffle_options_with_answer(q.options, q.correct_answer)
                q = q.model_copy(update={"options": shuffled, "correct_answer": ans})
            result.append(q)
        return result

    def _merge_and_dedupe(
        self,
        db_docs: list[dict],
        ai_questions: list[QuestionModel],
        exclude: set[str],
    ) -> list[QuestionModel]:
        combined: list[QuestionModel] = []
        seen: set[str] = set(exclude)

        for doc in db_docs:
            doc.pop("_id", None)
            try:
                q = QuestionModel(**doc)
                if q.id not in seen:
                    seen.add(q.id)
                    combined.append(q)
            except Exception:
                pass

        for q in ai_questions:
            if q.id not in seen:
                seen.add(q.id)
                combined.append(q)

        return self._shuffle_answers(combined)
