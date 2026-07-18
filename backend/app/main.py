"""Application entry point: build and configure the FastAPI instance."""

from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.router import api_router
from app.core.config import settings
from app.core.lifespan import lifespan
from app.core.rate_limit import limiter

logging.basicConfig(level=logging.INFO)


def create_app() -> FastAPI:
    """Application factory: instantiate and configure the FastAPI app."""
    app = FastAPI(
        title=settings.app_name,
        debug=settings.debug,
        lifespan=lifespan,
    )

    # Rate limiting: expose the limiter and return 429 when a limit is exceeded.
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # CORS: allow the frontend origins to call the API *with credentials* so the
    # browser sends/stores the auth cookie. Credentials require explicit origins
    # (no wildcard).
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Mount all API routes.
    app.include_router(api_router)

    return app


app = create_app()
