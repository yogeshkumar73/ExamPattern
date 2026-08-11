"""
Request Validation Helpers.

Pydantic-based request/response models for all API endpoints.
Centralised here to enforce consistent shapes across routes.
"""

from typing import Optional
from pydantic import BaseModel, Field, field_validator
from models.question import GameMode, Difficulty
from models.match import GameType


# ── Question API ──────────────────────────────────────────────

class QuestionQueryParams(BaseModel):
    """Query parameters for GET /api/questions."""
    mode: Optional[str] = None
    difficulty: Optional[str] = None
    limit: int = Field(default=20, ge=1, le=100)
    page: int = Field(default=1, ge=1)
    topic: Optional[str] = None
    exclude_ids: Optional[str] = None  # Comma-separated IDs

    @field_validator("mode")
    @classmethod
    def validate_mode(cls, v: Optional[str]) -> Optional[str]:
        if v and v not in [m.value for m in GameMode]:
            raise ValueError(f"Invalid mode: {v}. Must be one of {[m.value for m in GameMode]}")
        return v

    @field_validator("difficulty")
    @classmethod
    def validate_difficulty(cls, v: Optional[str]) -> Optional[str]:
        if v and v not in [d.value for d in Difficulty]:
            raise ValueError(f"Invalid difficulty: {v}. Must be one of {[d.value for d in Difficulty]}")
        return v

    def get_exclude_list(self) -> list[str]:
        if not self.exclude_ids:
            return []
        return [eid.strip() for eid in self.exclude_ids.split(",") if eid.strip()]


class StartSessionRequest(BaseModel):
    user_id: str = Field(..., min_length=1)
    mode: str = Field(...)
    topic: Optional[str] = None

    @field_validator("mode")
    @classmethod
    def validate_mode(cls, v: str) -> str:
        if v not in [m.value for m in GameMode]:
            raise ValueError(f"Invalid mode: {v}")
        return v


class AnswerSessionRequest(BaseModel):
    user_id: str = Field(..., min_length=1)
    session_id: str = Field(..., min_length=1)
    question_id: str = Field(..., min_length=1)
    answer: str = Field(...)


# ── Matchmaking API ───────────────────────────────────────────

class JoinQueueRequest(BaseModel):
    user_id: str = Field(..., min_length=1)
    name: str = Field(..., min_length=1, max_length=80)
    avatar: str = Field(default="")
    mode: str = Field(...)
    difficulty: str = Field(...)
    game_type: str = Field(default=GameType.PVP.value)
    elo: int = Field(default=1200, ge=0, le=9999)

    @field_validator("mode")
    @classmethod
    def validate_mode(cls, v: str) -> str:
        if v not in [m.value for m in GameMode]:
            raise ValueError(f"Invalid mode: {v}")
        return v

    @field_validator("difficulty")
    @classmethod
    def validate_difficulty(cls, v: str) -> str:
        if v not in [d.value for d in Difficulty]:
            raise ValueError(f"Invalid difficulty: {v}")
        return v


class LeaveQueueRequest(BaseModel):
    user_id: str = Field(..., min_length=1)


class CreateRoomRequest(BaseModel):
    host_id: str = Field(..., min_length=1)
    host_name: str = Field(..., min_length=1, max_length=80)
    mode: str = Field(...)
    difficulty: str = Field(...)
    game_type: str = Field(default=GameType.PVP.value)
    max_players: int = Field(default=2, ge=2, le=100)
    question_count: int = Field(default=10, ge=1, le=50)
    is_private: bool = False
    password: Optional[str] = None

    @field_validator("mode")
    @classmethod
    def validate_mode(cls, v: str) -> str:
        if v not in [m.value for m in GameMode]:
            raise ValueError(f"Invalid mode: {v}")
        return v


class StartMatchRequest(BaseModel):
    room_id: str = Field(..., min_length=1)
    host_id: str = Field(..., min_length=1)


# ── Leaderboard API ───────────────────────────────────────────

class BattleResultRequest(BaseModel):
    player_id: str = Field(..., min_length=1)
    player_name: str = Field(default="Player")
    opponent_id: Optional[str] = None
    won: bool
    mode: str
    difficulty: str
    correct_answers: int = Field(default=0, ge=0)
    total_questions: int = Field(default=1, ge=1)
    xp_earned: int = Field(default=0, ge=0)
    coins_earned: int = Field(default=0, ge=0)


# ── Shared API Response ───────────────────────────────────────

class APIResponse(BaseModel):
    """Consistent envelope for all API responses."""
    success: bool = True
    data: Optional[dict] = None
    error: Optional[str] = None
    meta: Optional[dict] = None
