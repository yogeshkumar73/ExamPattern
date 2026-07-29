"""
Match and Room data models for Battle Arena.
"""

from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class MatchStatus(str, Enum):
    """Match lifecycle states."""
    WAITING = "waiting"
    ACTIVE = "active"
    FINISHED = "finished"
    CANCELLED = "cancelled"


class GameType(str, Enum):
    """Battle type variants."""
    PVE = "1v_ai"
    PVP = "1v1"
    MULTI = "1v_many"
    TOURNAMENT = "tournament"
    PRACTICE = "practice"
    RANKED = "ranked"
    CUSTOM = "custom_room"
    PUBLIC = "public_match"
    PRIVATE = "private_match"


class ParticipantResult(BaseModel):
    """Individual participant result in a match."""
    user_id: str
    name: str
    avatar: str = ""
    score: int = 0
    xp_gained: int = 0
    coins_gained: int = 0
    accuracy: float = 0.0
    correct_answers: int = 0
    total_answers: int = 0
    speed: float = 0.0
    finished: bool = False
    finished_at: Optional[datetime] = None


class MatchModel(BaseModel):
    """A completed or in-progress match record."""
    match_id: str
    room_id: str
    game_type: GameType = GameType.PVP
    mode: str
    difficulty: str
    status: MatchStatus = MatchStatus.WAITING
    participants: list[ParticipantResult] = Field(default_factory=list)
    question_ids: list[str] = Field(default_factory=list)
    winner_id: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration: int = 300  # seconds
    tournament_id: Optional[str] = None
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )

    def to_mongo_dict(self) -> dict:
        data = self.model_dump()
        data["created_at"] = self.created_at
        return data


class RoomSettings(BaseModel):
    """Configuration for a game room."""
    mode: str = "math"
    difficulty: str = "beginner"
    game_type: GameType = GameType.PVP
    max_players: int = Field(default=2, ge=2, le=100)
    question_count: int = Field(default=10, ge=1, le=50)
    time_per_question: int = Field(default=60, ge=10, le=300)
    total_duration: int = Field(default=300, ge=60, le=3600)
    is_private: bool = False
    password: Optional[str] = None


class RoomModel(BaseModel):
    """A game room awaiting players or in progress."""
    room_id: str
    host_id: str
    host_name: str
    settings: RoomSettings
    player_ids: list[str] = Field(default_factory=list)
    status: MatchStatus = MatchStatus.WAITING
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )
    expires_at: Optional[datetime] = None

    def to_mongo_dict(self) -> dict:
        return self.model_dump()
