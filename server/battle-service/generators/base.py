"""
Abstract base class for all question generators.

Every generator must implement the `generate` method which produces
a list of QuestionModel instances for a given difficulty and count.
"""

from abc import ABC, abstractmethod

from models.question import QuestionModel, Difficulty


class BaseGenerator(ABC):
    """
    Abstract base for question generators.

    Subclasses implement `generate()` to produce questions using
    pure Python logic — no AI calls unless explicitly opted in.
    """

    @abstractmethod
    def generate(
        self,
        difficulty: Difficulty,
        count: int = 10,
        topic: str | None = None,
        exclude_ids: set[str] | None = None,
    ) -> list[QuestionModel]:
        """
        Generate a batch of questions.

        Args:
            difficulty: Target difficulty tier.
            count: Number of questions to generate.
            topic: Optional subtopic filter.
            exclude_ids: Question IDs to skip (deduplication).

        Returns:
            List of QuestionModel instances.
        """
        ...

    @property
    @abstractmethod
    def mode(self) -> str:
        """The game mode this generator serves (e.g. 'math', 'prediction')."""
        ...
