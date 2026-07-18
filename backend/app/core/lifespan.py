"""Application lifespan: open external connections on startup, close on shutdown.

Registered on the FastAPI app so that MongoDB and Redis clients are established
exactly once before the server accepts traffic, and cleanly torn down on exit.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.db.mongo import close_mongo, connect_mongo
from app.db.redis import close_redis, connect_redis

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Manage the startup/shutdown of shared resources."""
    logger.info("Starting up: connecting to MongoDB and Redis...")
    await connect_mongo()
    await connect_redis()
    logger.info("Startup complete.")

    yield

    logger.info("Shutting down: closing MongoDB and Redis connections...")
    await close_redis()
    await close_mongo()
    logger.info("Shutdown complete.")
