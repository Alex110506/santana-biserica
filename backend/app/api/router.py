"""Aggregate API router.

Individual route modules are collected here and mounted under the API prefix in
``app.main``. New resources should register their router in this module.
"""

from __future__ import annotations

from fastapi import APIRouter

from app.api.routes import auth, content, health

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(content.router)
