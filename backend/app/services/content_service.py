"""Site-content storage: MongoDB for persistence, Redis as the read cache.

Write path (admin saves a section): the payload is written to BOTH stores —
MongoDB (``site_content`` collection, one document per section) and Redis
(``content:<section>`` key, JSON), overwriting whatever the cache held.

Read path (public GET): Redis first; on a miss the section is loaded from
MongoDB and the cache is repopulated, so the next request is served from
memory again. Content keys have no TTL — every save overwrites them, and the
gallery service keeps its key in sync the same way.
"""

from __future__ import annotations

import asyncio
import json
from datetime import UTC, datetime

from app.db.mongo import get_database
from app.db.redis import get_redis

COLLECTION_NAME = "site_content"
REDIS_PREFIX = "content:"

# Sections stored here as one document each (the gallery lives in its own
# collection — see gallery_service — but shares the same Redis convention).
SECTION_ABOUT = "about"
SECTION_SCHEDULE = "schedule"
SECTION_CLERGY = "clergy"
SECTION_EVENTS = "events"


def redis_key(section: str) -> str:
    return f"{REDIS_PREFIX}{section}"


async def get_section(section: str) -> dict | None:
    """Return a section's payload — Redis first, MongoDB on a cache miss.

    Repopulates Redis after a miss. Returns ``None`` if the section was never
    saved (callers turn that into a 404 and the frontend keeps its defaults).
    """
    redis = get_redis()
    cached = await redis.get(redis_key(section))
    if cached is not None:
        return json.loads(cached)

    document = await get_database()[COLLECTION_NAME].find_one({"_id": section})
    if document is None:
        return None

    data = document["data"]
    await redis.set(redis_key(section), json.dumps(data, ensure_ascii=False))
    return data


async def save_section(section: str, data: dict) -> None:
    """Persist a section to MongoDB and overwrite the Redis cache, together."""
    mongo_write = get_database()[COLLECTION_NAME].update_one(
        {"_id": section},
        {"$set": {"data": data, "updated_at": datetime.now(UTC)}},
        upsert=True,
    )
    redis_write = get_redis().set(
        redis_key(section), json.dumps(data, ensure_ascii=False)
    )
    await asyncio.gather(mongo_write, redis_write)
