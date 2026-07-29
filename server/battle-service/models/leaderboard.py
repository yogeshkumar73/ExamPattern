"""
Leaderboard data models.
"""

from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class RankTier(str, Enum):
    """Competitive rank tiers based on ELO."""
    UNRANKED = "Unranked"
    BRONZE = "Bronze"
    SILVER = "Silver"
    GOLD = "Gold"
    PLATINUM = "Platinum"
    DIAMOND = "Diamond"
    MASTER = "Master"
    GRANDMASTER = "Grandmaster"


# ELO thresholds for rank tiers
RANK_THRESHOLDS: list[tuple[int, RankTier]] = [
    (2400, RankTier.GRANDMASTER),
    (2000, RankTier.MASTER),
    (1700, RankTier.DIAMOND),
    (1400, RankTier.PLATINUM),
    (1200, RankTier.GOLD),
    (1000, RankTier.SILVER),
    (800, RankTier.BRONZE),
]


def compute_rank(elo: int) -> RankTier:
    """Determine rank tier from ELO rating."""
    for threshold, tier in RANK_THRESHOLDS:
        if elo >= threshold:
            return tier
    return RankTier.UNRANKED


def compute_elo_change(
    player_elo: int,
    opponent_elo: int,
    won: bool,
    k_factor: int = 32,
) -> int:
    """
    Calculate ELO rating change using the standard formula.

    Args:
        player_elo: Current player ELO.
        opponent_elo: Opponent's ELO.
        won: Whether the player won.
        k_factor: K-factor (higher = more volatile ratings).

    Returns:
        The ELO change (positive for win, negative for loss).
    """
    expected = 1 / (1 + 10 ** ((opponent_elo - player_elo) / 400))
    actual = 1.0 if won else 0.0
    return round(k_factor * (actual - expected))


class LeaderboardEntry(BaseModel):
    """A single row in the leaderboard."""
    rank: int = 0
    player_id: str
    name: str = ""
    avatar: str = ""
    elo: int = 1200
    rank_tier: RankTier = RankTier.UNRANKED
    xp: int = 0
    coins: int = 0
    level: int = 1
    wins: int = 0
    losses: int = 0
    win_rate: float = 0.0
    accuracy: float = 0.0
    total_correct: int = 0
    current_streak: int = 0
    best_streak: int = 0
    total_battles: int = 0
    mode_filter: Optional[str] = None


class LeaderboardResponse(BaseModel):
    """API response for leaderboard queries."""
    entries: list[LeaderboardEntry]
    total: int
    category: str = "global"
    page: int = 1
    limit: int = 50
