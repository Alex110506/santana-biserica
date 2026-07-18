"""Gallery storage: image bytes in Cloudflare R2, references in MongoDB,
mirror in Redis.

Upload flow (async end to end): the route receives the file, the name is
replaced with a UUID (never the original filename), the bytes are streamed to
R2 through aioboto3 (non-blocking, the worker stays free), then the reference
document lands in the ``photo_gallery`` collection and the Redis key
``content:gallery`` is rewritten — Mongo and Redis stay in lockstep, and the
public page reads from Redis without touching Mongo.

Reconciliation (the section's „Salvează”): captions/order are updated, images
missing from the submitted list are deleted from Mongo and (best-effort) from
R2, and the cache is rewritten.
"""

from __future__ import annotations

import asyncio
import json
import logging
import uuid
from datetime import UTC, datetime

import aioboto3

from app.core.config import settings
from app.db.mongo import get_database
from app.db.redis import get_redis
from app.services.content_service import redis_key

logger = logging.getLogger(__name__)

COLLECTION_NAME = "photo_gallery"
SECTION = "gallery"

# Content types the gallery accepts, mapped to the stored extension.
ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}

_session = aioboto3.Session()


def _s3_client():
    """A fresh async S3 client context for the R2 endpoint."""
    return _session.client(
        "s3",
        endpoint_url=settings.s3_endpoint_url,
        aws_access_key_id=settings.s3_access_key_id,
        aws_secret_access_key=settings.s3_secret_access_key,
        region_name=settings.s3_region,
    )


def _public_url(key: str) -> str:
    return f"{settings.s3_public_base_url.rstrip('/')}/{key}"


def _to_image(document: dict) -> dict:
    return {
        "id": document["_id"],
        "url": document["url"],
        "caption": document.get("caption", ""),
    }


async def _list_images() -> list[dict]:
    """All gallery images from MongoDB, in display order."""
    cursor = get_database()[COLLECTION_NAME].find({}).sort("position", 1)
    return [_to_image(doc) async for doc in cursor]


async def _refresh_cache() -> list[dict]:
    """Rewrite ``content:gallery`` in Redis from MongoDB; returns the list."""
    images = await _list_images()
    payload = json.dumps({"images": images}, ensure_ascii=False)
    await get_redis().set(redis_key(SECTION), payload)
    return images


async def get_gallery() -> dict | None:
    """Gallery payload — Redis first, MongoDB on a miss (then re-cached).

    ``None`` when no image was ever uploaded (the frontend keeps its
    placeholder set in that case).
    """
    cached = await get_redis().get(redis_key(SECTION))
    if cached is not None:
        return json.loads(cached)

    images = await _list_images()
    if not images:
        return None
    await _refresh_cache()
    return {"images": images}


async def count_images() -> int:
    return await get_database()[COLLECTION_NAME].count_documents({})


async def upload_images(files: list[tuple[bytes, str]]) -> list[dict]:
    """Upload ``(bytes, content_type)`` pairs to R2 and persist references.

    Returns the newly created image dicts. Uploads run concurrently inside a
    single client session; Mongo insert + Redis rewrite follow once all bytes
    are safely in R2.
    """
    now = datetime.now(UTC)
    database = get_database()

    last = await (
        database[COLLECTION_NAME].find({}).sort("position", -1).limit(1).to_list(1)
    )
    next_position = (last[0]["position"] + 1) if last else 0

    documents = []
    for offset, (data, content_type) in enumerate(files):
        image_id = uuid.uuid4().hex
        key = f"galerie/{image_id}{ALLOWED_IMAGE_TYPES[content_type]}"
        documents.append(
            {
                "_id": image_id,
                "key": key,
                "url": _public_url(key),
                "caption": "",
                "position": next_position + offset,
                "content_type": content_type,
                "uploaded_at": now,
                "_body": data,  # stripped before insert
            }
        )

    async with _s3_client() as s3:
        await asyncio.gather(
            *(
                s3.put_object(
                    Bucket=settings.s3_bucket,
                    Key=doc["key"],
                    Body=doc.pop("_body"),
                    ContentType=doc["content_type"],
                    CacheControl="public, max-age=31536000, immutable",
                )
                for doc in documents
            )
        )

    await database[COLLECTION_NAME].insert_many(documents)
    await _refresh_cache()
    return [_to_image(doc) for doc in documents]


async def save_gallery(images: list[dict]) -> list[dict]:
    """Reconcile the stored gallery with the submitted list.

    ``images`` items are ``{id, caption}`` (+ ignored url — the stored URL is
    authoritative). Unknown ids raise ``ValueError``. Images left out of the
    list are deleted from MongoDB and, best-effort, from R2.
    """
    database = get_database()
    existing = {doc["_id"]: doc async for doc in database[COLLECTION_NAME].find({})}

    unknown = [img["id"] for img in images if img["id"] not in existing]
    if unknown:
        raise ValueError(f"imagini inexistente: {', '.join(unknown)}")

    kept_ids = {img["id"] for img in images}
    removed = [doc for doc_id, doc in existing.items() if doc_id not in kept_ids]

    for position, image in enumerate(images):
        await database[COLLECTION_NAME].update_one(
            {"_id": image["id"]},
            {"$set": {"caption": image.get("caption", ""), "position": position}},
        )

    if removed:
        await database[COLLECTION_NAME].delete_many(
            {"_id": {"$in": [doc["_id"] for doc in removed]}}
        )
        # R2 cleanup is best-effort: a leftover object costs cents, a failed
        # save because storage hiccuped would lose the admin's work.
        try:
            async with _s3_client() as s3:
                await s3.delete_objects(
                    Bucket=settings.s3_bucket,
                    Delete={
                        "Objects": [{"Key": doc["key"]} for doc in removed if "key" in doc],
                        "Quiet": True,
                    },
                )
        except Exception:  # noqa: BLE001 - log and move on
            logger.warning("Nu s-au putut șterge obiectele din R2", exc_info=True)

    return await _refresh_cache()
