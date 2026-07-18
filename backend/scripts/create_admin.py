"""Seed or update an admin account (bcrypt-hashed password).

Usage:
    uv run python -m scripts.create_admin --username admin --password 'parola'

Idempotent: an existing username gets its password replaced; a new one is
created. Also ensures the unique index on ``username``.
"""

from __future__ import annotations

import argparse
import asyncio
from datetime import UTC, datetime

from pymongo import AsyncMongoClient

from app.core.config import settings
from app.core.security import hash_password
from app.models.admin import COLLECTION_NAME


async def main() -> None:
    parser = argparse.ArgumentParser(description="Seed/update an admin account.")
    parser.add_argument("--username", required=True)
    parser.add_argument("--password", required=True)
    args = parser.parse_args()

    client = AsyncMongoClient(settings.mongo_url, serverSelectionTimeoutMS=8000)
    try:
        collection = client[settings.mongo_db_name][COLLECTION_NAME]
        await collection.create_index("username", unique=True)
        result = await collection.update_one(
            {"username": args.username},
            {
                "$set": {"password_hash": hash_password(args.password)},
                "$setOnInsert": {"created_at": datetime.now(UTC)},
            },
            upsert=True,
        )
        action = "creat" if result.upserted_id else "actualizat"
        print(f"Admin „{args.username}” {action}.")
    finally:
        await client.close()


if __name__ == "__main__":
    asyncio.run(main())
