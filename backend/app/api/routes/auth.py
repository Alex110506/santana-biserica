"""Authentication routes: login, logout, and current-admin lookup."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Request, Response

from app.api.deps import get_current_admin
from app.controllers import auth_controller
from app.core.config import settings
from app.core.rate_limit import limiter
from app.models.admin import AdminAccount
from app.schemas.auth import (
    AdminPublic,
    LoginRequest,
    LoginResponse,
    MessageResponse,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse, summary="Admin login")
@limiter.limit(settings.auth_rate_limit)
async def login(
    request: Request, payload: LoginRequest, response: Response
) -> LoginResponse:
    """Validate credentials and set a 7-day httpOnly JWT cookie on success.

    Rate limited per client IP (``request`` is required by slowapi).
    """
    return await auth_controller.login(payload, response)


@router.post("/logout", response_model=MessageResponse, summary="Admin logout")
@limiter.limit(settings.auth_rate_limit)
async def logout(request: Request, response: Response) -> MessageResponse:
    """Clear the auth cookie. Rate limited per client IP."""
    return await auth_controller.logout(response)


@router.get("/me", response_model=AdminPublic, summary="Current admin")
async def me(admin: AdminAccount = Depends(get_current_admin)) -> AdminPublic:
    """Return the authenticated admin — used by the frontend to gate routes."""
    return await auth_controller.me(admin)
