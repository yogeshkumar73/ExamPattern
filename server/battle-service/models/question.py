"""
Question data models for Battle Arena.

Defines the canonical QuestionModel used across all generators,
the question service, cache, and API responses.
"""

from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class GameMode(str, Enum):
    """Supported game modes."""
    CODING = "coding"
    MATH = "math"
    GK = "gk"
    PUZZLE = "puzzle"
    PREDICTION = "prediction"
    MIXED = "mixed"


class Difficulty(str, Enum):
    """Supported difficulty tiers."""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class QuestionType(str, Enum):
    """Supported question types."""
    MCQ = "mcq"
    TRUE_FALSE = "true_false"
    FILL_BLANK = "fill_blank"
    SHORT_ANSWER = "short_answer"
    CODE_OUTPUT = "code_output"
    PATTERN_RECOGNITION = "pattern_recognition"


class QuestionModel(BaseModel):
    """
    Canonical question model used by all generators and services.

    Every question in the system — whether from the static bank, Python
    generators, or AI — is normalized into this schema before being
    served to the frontend.
    """
    id: str = Field(..., description="Unique question identifier")
    mode: GameMode = Field(..., description="Game mode category")
    difficulty: Difficulty = Field(..., description="Difficulty tier")
    topic: str = Field(default="general", description="Topic or subcategory")
    question: str = Field(..., description="The question text")
    question_type: QuestionType = Field(
        default=QuestionType.MCQ,
        description="Type of question",
    )
    options: list[str] = Field(
        default_factory=list,
        description="Answer options (for MCQ / true-false)",
    )
    correct_answer: str = Field(..., description="The correct answer")
    explanation: str = Field(
        default="",
        description="Explanation of the correct answer",
    )
    hint: str = Field(default="", description="Hint for the player")
    time_limit: int = Field(default=60, ge=10, le=300, description="Time limit in seconds")
    xp: int = Field(default=50, ge=0, description="XP reward for correct answer")
    coins: int = Field(default=10, ge=0, description="Coin reward for correct answer")
    tags: list[str] = Field(default_factory=list, description="Searchable tags")
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Creation timestamp",
    )

    # Optional fields for specific question types
    boilerplate: Optional[str] = Field(
        default=None,
        description="Code boilerplate (for coding mode)",
    )
    sequence: Optional[list[int | float]] = Field(
        default=None,
        description="Number sequence (for prediction mode)",
    )

    def to_mongo_dict(self) -> dict:
        """Convert to a MongoDB-friendly dictionary."""
        data = self.model_dump()
        data["created_at"] = self.created_at
        return data

    @classmethod
    def from_mongo(cls, doc: dict) -> "QuestionModel":
        """Create a QuestionModel from a MongoDB document."""
        if "_id" in doc:
            doc["id"] = str(doc.pop("_id"))
        return cls(**doc)


class QuestionBatch(BaseModel):
    """A batch of questions returned by the question service."""
    questions: list[QuestionModel]
    total: int
    page: int = 1
    limit: int = 20
    source: str = "generator"  # cache | db | generator | ai
