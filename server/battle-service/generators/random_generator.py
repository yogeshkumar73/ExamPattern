"""
Random/Mixed Question Generator.

Delegates to all other generators randomly, producing a mixed
bag of questions across all modes.
"""

import random

from generators.base import BaseGenerator
from generators.math_generator import MathGenerator
from generators.gk_generator import GKGenerator
from generators.coding_generator import CodingGenerator
from generators.puzzle_generator import PuzzleGenerator
from generators.prediction_generator import PredictionGenerator
from models.question import QuestionModel, Difficulty, GameMode


class RandomGenerator(BaseGenerator):
    """Mixes questions from all generators for 'mixed' mode battles."""

    def __init__(self) -> None:
        self._generators: list[BaseGenerator] = [
            MathGenerator(),
            GKGenerator(),
            CodingGenerator(),
            PuzzleGenerator(),
            PredictionGenerator(),
        ]

    @property
    def mode(self) -> str:
        return GameMode.MIXED.value

    def generate(
        self,
        difficulty: Difficulty,
        count: int = 10,
        topic: str | None = None,
        exclude_ids: set[str] | None = None,
    ) -> list[QuestionModel]:
        exclude = exclude_ids or set()

        # Distribute questions roughly equally across generators
        per_gen = max(1, count // len(self._generators))
        remainder = count - per_gen * len(self._generators)

        questions: list[QuestionModel] = []
        gen_order = list(self._generators)
        random.shuffle(gen_order)

        for i, gen in enumerate(gen_order):
            batch_count = per_gen + (1 if i < remainder else 0)
            batch = gen.generate(
                difficulty=difficulty,
                count=batch_count,
                exclude_ids=exclude,
            )
            for q in batch:
                exclude.add(q.id)
            questions.extend(batch)

        random.shuffle(questions)
        return questions[:count]
