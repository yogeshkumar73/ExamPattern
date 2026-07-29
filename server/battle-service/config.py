"""
Battle Service Configuration
Loads settings from environment variables with sensible defaults.
"""

import os
from pathlib import Path
from typing import Optional

# pyrefly: ignore [missing-import]
from pydantic_settings import BaseSettings
from pydantic import Field


# Resolve .env path from project root (two levels up from battle-service)
_ENV_PATH = Path(__file__).resolve().parent.parent.parent / ".env"


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # ── Database ──────────────────────────────────────────────
    MONGODB_URI: str = Field(
        default="mongodb://localhost:27017/battle_arena",
        description="MongoDB connection string",
    )
    DATABASE_NAME: str = Field(
        default="battle_arena",
        description="MongoDB database name",
    )

    # ── AI (Optional) ────────────────────────────────────────
    OPENAI_API_KEY: Optional[str] = Field(
        default=None,
        description="OpenAI or OpenRouter API key (optional)",
    )
    AI_ENABLED: bool = Field(
        default=False,
        description="Enable AI question generation (requires OPENAI_API_KEY)",
    )
    AI_MODEL: str = Field(
        default="gpt-3.5-turbo",
        description="OpenAI model to use for question generation",
    )
    AI_MAX_TOKENS: int = Field(default=2000, ge=100, le=8000)
    AI_TEMPERATURE: float = Field(default=0.7, ge=0.0, le=2.0)

    # ── Cache ─────────────────────────────────────────────────
    REDIS_URL: Optional[str] = Field(
        default=None,
        description="Redis URL for caching (optional, falls back to memory)",
    )
    CACHE_TTL_SECONDS: int = Field(
        default=600,
        description="Cache time-to-live in seconds (default: 10 minutes)",
    )

    # ── Questions ─────────────────────────────────────────────
    DEFAULT_QUESTION_LIMIT: int = Field(default=20, ge=1, le=100)
    MAX_QUESTION_LIMIT: int = Field(default=100, ge=1, le=500)

    # ── Matchmaking ───────────────────────────────────────────
    MATCHMAKING_TIMEOUT_SECONDS: int = Field(default=60)
    ROOM_EXPIRY_SECONDS: int = Field(default=3600)
    HEARTBEAT_INTERVAL_SECONDS: int = Field(default=10)

    # ── ELO ───────────────────────────────────────────────────
    ELO_K_FACTOR: int = Field(default=32)
    ELO_STARTING_RATING: int = Field(default=1200)

    # ── Rate Limiting ─────────────────────────────────────────
    RATE_LIMIT_REQUESTS: int = Field(default=100)
    RATE_LIMIT_WINDOW_SECONDS: int = Field(default=60)

    # ── Server ────────────────────────────────────────────────
    HOST: str = Field(default="0.0.0.0")
    PORT: int = Field(default=8001)
    DEBUG: bool = Field(default=True)
    CORS_ORIGINS: str = Field(default="http://localhost:3000")

    model_config = {
        "env_file": str(_ENV_PATH),
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def ai_available(self) -> bool:
        return self.AI_ENABLED and bool(self.OPENAI_API_KEY)


# Singleton settings instance
settings = Settings()
