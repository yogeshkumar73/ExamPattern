"""
Player statistics and matchmaking queue models.
"""

from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class QueueStatus(str, Enum):
    """Player queue status."""
    SEARCHING = "searching"
    MATCHED = "matched"
    CANCELLED = "cancelled"
    TIMEOUT = "timeout"


class PlayerInQueue(BaseModel):
    """A player waiting in a matchmaking queue."""
    user_id: str
    name: str
    avatar: str = ""
    mode: str
    difficulty: str
    game_type: str = "1v1"
    elo: int = 1200
    joined_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )


class PlayerStats(BaseModel):
    """
    Persistent player statistics.

    Tracks wins, losses, streaks, XP, coins, ELO, and per-mode breakdown.
    """
    player_id: str
    name: str = ""
    avatar: str = ""

    # ── Core stats ────────────────────────────────────────
    xp: int = 0
    coins: int = 0
    level: int = 1
    elo: int = 1200

    # ── Battle stats ──────────────────────────────────────
    total_battles: int = 0
    wins: int = 0
    losses: int = 0
    draws: int = 0
    win_rate: float = 0.0
    accuracy: float = 0.0
    total_correct: int = 0
    total_attempted: int = 0

    # ── Streaks ───────────────────────────────────────────
    current_streak: int = 0
    best_streak: int = 0

    # ── Per-mode stats ────────────────────────────────────
    mode_stats: dict[str, dict] = Field(default_factory=dict)
    # Example: {"math": {"wins": 5, "losses": 2, "xp": 300}}

    # ── Timestamps ────────────────────────────────────────
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )

    def compute_win_rate(self) -> float:
        if self.total_battles == 0:
            return 0.0
        return round((self.wins / self.total_battles) * 100, 1)

    def compute_accuracy(self) -> float:
        if self.total_attempted == 0:
            return 0.0
        return round((self.total_correct / self.total_attempted) * 100, 1)

    def compute_level(self) -> int:
        """Level = floor(sqrt(xp / 100)) + 1."""
        import math
        return int(math.floor(math.sqrt(self.xp / 100))) + 1

    def to_mongo_dict(self) -> dict:
        data = self.model_dump()
        data["updated_at"] = datetime.now(timezone.utc)
        return data
