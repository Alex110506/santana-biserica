"""MongoDB client management.

Uses PyMongo's native async driver (``AsyncMongoClient``). A single client is
created at application startup and reused for the process lifetime — the client
manages its own internal connection pool, so it must not be created per-request.
"""

from __future__ import annotations

from pymongo import AsyncMongoClient
from pymongo.asynchronous.database import AsyncDatabase

from app.core.config import settings

_client: AsyncMongoClient | None = None


async def connect_mongo() -> None:
    """Open the MongoDB client and verify connectivity."""
    global _client
    if _client is not None:
        return
    _client = AsyncMongoClient(settings.mongo_url, serverSelectionTimeoutMS=5000)
    # Fail fast at startup if the instance is unreachable.
    await _client.admin.command("ping")


async def close_mongo() -> None:
    """Close the MongoDB client and release pooled connections."""
    global _client
    if _client is not None:
        await _client.close()
        _client = None


def get_client() -> AsyncMongoClient:
    """Return the active client, or raise if the app is not connected yet."""
    if _client is None:
        raise RuntimeError("MongoDB client is not initialised. Did startup run?")
    return _client


def get_database() -> AsyncDatabase:
    """Return the application's default database handle."""
    return get_client()[settings.mongo_db_name]
