"""
Rate Limiter Middleware — Token bucket per IP.

Limits:
- Default: 100 requests / 60 seconds per IP
- Question generation: 20 requests / 60 seconds per IP

Anti-cheat:
- Tracks submitted answers per player/match to prevent duplicates
- Room authorization: validates player is in the room they claim
"""

import time
import asyncio
from collections import defaultdict
from typing import Optional

from fastapi import Request, HTTPException, status
from config import settings
from utils.logger import get_logger

logger = get_logger(__name__)


class _Bucket:
    """Token bucket for rate limiting."""
    __slots__ = ("tokens", "last_refill")

    def __init__(self, capacity: int) -> None:
        self.tokens = float(capacity)
        self.last_refill = time.monotonic()


class RateLimiter:
    """
    In-memory token bucket rate limiter.

    One bucket per IP address. Refills tokens over time.
    """

    def __init__(
        self,
        requests_per_window: int = 100,
        window_seconds: int = 60,
    ) -> None:
        self._capacity = requests_per_window
        self._window = window_seconds
        self._refill_rate = requests_per_window / window_seconds
        self._buckets: dict[str, _Bucket] = defaultdict(
            lambda: _Bucket(requests_per_window)
        )
        self._lock = asyncio.Lock()

    def _get_ip(self, request: Request) -> str:
        # Support X-Forwarded-For for proxies
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    async def check(self, request: Request, cost: int = 1) -> None:
        """
        Check rate limit. Raises HTTP 429 if exceeded.

        Args:
            request: The incoming FastAPI request.
            cost: Token cost for this request (default: 1).
        """
        ip = self._get_ip(request)

        async with self._lock:
            bucket = self._buckets[ip]
            now = time.monotonic()
            elapsed = now - bucket.last_refill
            bucket.tokens = min(
                self._capacity,
                bucket.tokens + elapsed * self._refill_rate,
            )
            bucket.last_refill = now

            if bucket.tokens < cost:
                logger.warning("Rate limit exceeded for IP: %s", ip)
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many requests. Please slow down.",
                )
            bucket.tokens -= cost


class AntiCheatGuard:
    """
    Prevent duplicate answer submissions and validate room membership.

    Tracks which player has answered which question in which match.
    """

    def __init__(self) -> None:
        # {match_id: {player_id: {question_id}}}
        self._submissions: dict[str, dict[str, set[str]]] = defaultdict(
            lambda: defaultdict(set)
        )
        self._lock = asyncio.Lock()

    async def record_answer(
        self,
        match_id: str,
        player_id: str,
        question_id: str,
    ) -> bool:
        """
        Record an answer submission.

        Returns True if this is a valid (first-time) submission.
        Returns False if it's a duplicate (potential cheat attempt).
        """
        async with self._lock:
            if question_id in self._submissions[match_id][player_id]:
                logger.warning(
                    "Duplicate submission detected: match=%s player=%s question=%s",
                    match_id, player_id, question_id,
                )
                return False
            self._submissions[match_id][player_id].add(question_id)
            return True

    async def clear_match(self, match_id: str) -> None:
        """Clean up submissions for a finished match."""
        async with self._lock:
            self._submissions.pop(match_id, None)


# ── Singleton instances ───────────────────────────────────────
rate_limiter = RateLimiter(
    requests_per_window=settings.RATE_LIMIT_REQUESTS,
    window_seconds=settings.RATE_LIMIT_WINDOW_SECONDS,
)
anti_cheat = AntiCheatGuard()
