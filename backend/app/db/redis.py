"""Redis client management.

A single async Redis client (with an internal connection pool) is created at
startup and shared across the app. Per the architecture, this cache is written
by the scraper node and read by the backend.
"""

from __future__ import annotations

from redis.asyncio import Redis
from redis.asyncio import from_url as redis_from_url

from app.core.config import settings

_client: Redis | None = None


async def connect_redis() -> None:
    """Open the Redis client and verify connectivity."""
    global _client
    if _client is not None:
        return
    _client = redis_from_url(
        settings.redis_url,
        encoding="utf-8",
        decode_responses=True,
    )
    # Fail fast at startup if the node is unreachable.
    await _client.ping()


async def close_redis() -> None:
    """Close the Redis client and release pooled connections."""
    global _client
    if _client is not None:
        await _client.aclose()
        _client = None


def get_redis() -> Redis:
    """Return the active client, or raise if the app is not connected yet."""
    if _client is None:
        raise RuntimeError("Redis client is not initialised. Did startup run?")
    return _client
