"""Auth controllers: orchestrate login/logout and expose the current admin.

Controllers own HTTP concerns (status codes, cookies) and delegate credential
checking and token issuing to ``auth_service``.
"""

from __future__ import annotations

from fastapi import HTTPException, Response, status

from app.core.config import settings
from app.models.admin import AdminAccount
from app.schemas.auth import AdminPublic, LoginRequest, LoginResponse, MessageResponse
from app.services import auth_service

# Cookie lifetime in seconds (mirrors the JWT expiry).
_COOKIE_MAX_AGE = settings.jwt_expiry_days * 24 * 60 * 60


def _set_auth_cookie(response: Response, token: str) -> None:
    """Attach the signed JWT to the response as an httpOnly cookie."""
    response.set_cookie(
        key=settings.auth_cookie_name,
        value=token,
        max_age=_COOKIE_MAX_AGE,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        domain=settings.cookie_domain,
        path="/",
    )


def _clear_auth_cookie(response: Response) -> None:
    """Remove the auth cookie (used on logout)."""
    response.delete_cookie(
        key=settings.auth_cookie_name,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        domain=settings.cookie_domain,
        path="/",
    )


async def login(payload: LoginRequest, response: Response) -> LoginResponse:
    """Verify credentials and, on success, set the JWT cookie."""
    admin = await auth_service.authenticate(payload.username, payload.password)
    if admin is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
        )

    token = auth_service.issue_token(admin)
    _set_auth_cookie(response, token)
    return LoginResponse(admin=AdminPublic(username=admin.username))


async def logout(response: Response) -> MessageResponse:
    """Clear the auth cookie."""
    _clear_auth_cookie(response)
    return MessageResponse(detail="Logged out.")


async def me(admin: AdminAccount) -> AdminPublic:
    """Return the currently authenticated admin (resolved by the guard)."""
    return AdminPublic(username=admin.username)
