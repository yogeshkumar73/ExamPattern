"""
Random/Mixed Question Generator.

Generates a random mix of questions from all generators while
ensuring no duplicate questions are returned.
"""

import random

from generators.base import BaseGenerator
from generators.math_generator import MathGenerator
from generators.gk_generator import GKGenerator
from generators.coding_generator import CodingGenerator
from generators.puzzle_generator import PuzzleGenerator
from generators.prediction_generator import PredictionGenerator

from models.question import (
    QuestionModel,
    Difficulty,
    GameMode,
)


class RandomGenerator(BaseGenerator):
    """Mixes unique questions from all generators."""

    MAX_RETRY_MULTIPLIER = 20

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
        """
        Generate a mixed list of unique questions.

        Parameters
        ----------
        difficulty : Difficulty
        count : int
        topic : str | None
        exclude_ids : set[str] | None
            Previously generated question IDs.

        Returns
        -------
        list[QuestionModel]
        """

        used_ids: set[str] = set(exclude_ids or [])

        questions: list[QuestionModel] = []

        generators = self._generators[:]
        random.shuffle(generators)

        max_attempts = max(count * self.MAX_RETRY_MULTIPLIER, 100)
        attempts = 0

        while len(questions) < count and attempts < max_attempts:
            attempts += 1

            generator = random.choice(generators)

            try:
                batch = generator.generate(
                    difficulty=difficulty,
                    count=1,
                    topic=topic,
                    exclude_ids=used_ids,
                )
            except Exception:
                continue

            if not batch:
                continue

            question = batch[0]

            # Skip duplicate IDs
            if question.id in used_ids:
                continue

            used_ids.add(question.id)
            questions.append(question)

        random.shuffle(questions)

        return questions