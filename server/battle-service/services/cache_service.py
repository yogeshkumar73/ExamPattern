"""
Cache Service — In-memory TTL cache with optional Redis backend.

Default: memory-only (no dependencies).
Optional: Redis via REDIS_URL env variable.

TTL: 10 minutes (600 seconds) by default.
"""

import asyncio
import time
from typing import Any, Optional

from utils.logger import get_logger

logger = get_logger(__name__)


class _CacheEntry:
    """Single cache item with expiry timestamp."""
    __slots__ = ("value", "expires_at")

    def __init__(self, value: Any, ttl: int) -> None:
        self.value = value
        self.expires_at = time.monotonic() + ttl


class CacheService:
    """
    In-memory TTL cache with optional Redis fallback.

    Thread-safe for async workloads. Redis is used when REDIS_URL
    is configured; otherwise falls back to in-process dict.
    """

    def __init__(self, ttl: int = 600, redis_url: Optional[str] = None) -> None:
        self._ttl = ttl
        self._store: dict[str, _CacheEntry] = {}
        self._redis_url = redis_url
        self._redis: Any = None  # redis.asyncio client, if configured
        self._lock = asyncio.Lock()

    async def init_redis(self) -> None:
        """Try to connect to Redis. Falls back silently to memory if unavailable."""
        if not self._redis_url:
            return
        try:
            import redis.asyncio as aioredis  # type: ignore
            self._redis = await aioredis.from_url(
                self._redis_url,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=2,
            )
            await self._redis.ping()
            logger.info("Redis cache connected: %s", self._redis_url)
        except Exception as exc:
            logger.warning("Redis unavailable, using memory cache: %s", exc)
            self._redis = None

    # ── Public API ────────────────────────────────────────────

    async def get(self, key: str) -> Optional[Any]:
        """Return cached value or None if missing/expired."""
        # Try Redis first
        if self._redis:
            try:
                import json
                raw = await self._redis.get(key)
                if raw is not None:
                    return json.loads(raw)
            except Exception as exc:
                logger.warning("Redis get error, falling back to memory: %s", exc)

        # Memory fallback
        async with self._lock:
            entry = self._store.get(key)
            if entry and time.monotonic() < entry.expires_at:
                return entry.value
            if entry:
                del self._store[key]  # Expired — evict
        return None

    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Store a value with TTL."""
        effective_ttl = ttl if ttl is not None else self._ttl

        # Try Redis first
        if self._redis:
            try:
                import json
                await self._redis.setex(key, effective_ttl, json.dumps(value))
                return
            except Exception as exc:
                logger.warning("Redis set error, writing to memory: %s", exc)

        # Memory fallback
        async with self._lock:
            self._store[key] = _CacheEntry(value, effective_ttl)

    async def invalidate(self, key: str) -> None:
        """Remove a specific cache entry."""
        if self._redis:
            try:
                await self._redis.delete(key)
                return
            except Exception:
                pass
        async with self._lock:
            self._store.pop(key, None)

    async def clear(self) -> None:
        """Clear ALL cached entries."""
        if self._redis:
            try:
                await self._redis.flushdb()
                return
            except Exception:
                pass
        async with self._lock:
            self._store.clear()

    async def cleanup_expired(self) -> int:
        """Evict all expired memory entries. Returns count removed."""
        now = time.monotonic()
        async with self._lock:
            expired = [k for k, v in self._store.items() if now >= v.expires_at]
            for k in expired:
                del self._store[k]
        return len(expired)

    @staticmethod
    def make_key(prefix: str, **kwargs: Any) -> str:
        """Build a deterministic cache key from prefix + kwargs."""
        parts = [prefix] + [f"{k}={v}" for k, v in sorted(kwargs.items())]
        return ":".join(str(p) for p in parts)
