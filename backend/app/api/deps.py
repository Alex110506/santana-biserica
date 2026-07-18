"""Reusable API dependencies.

``get_current_admin`` is the JWT-verification guard for admin-only routes. In
FastAPI the idiomatic way to protect *selected* routes (rather than every
request, which would also block ``/login``, ``/health`` and the docs) is a
dependency. Apply it per-route::

    @router.get("/thing")
    async def read(admin: AdminAccount = Depends(get_current_admin)): ...

or to a whole router at once::

    APIRouter(dependencies=[Depends(get_current_admin)])
"""

from __future__ import annotations

import jwt
from fastapi import Cookie, HTTPException, status

from app.core.config import settings
from app.core.security import decode_access_token
from app.models.admin import AdminAccount
from app.services import auth_service

_CREDENTIALS_ERROR = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Not authenticated.",
)


async def get_current_admin(
    token: str | None = Cookie(default=None, alias=settings.auth_cookie_name),
) -> AdminAccount:
    """Validate the JWT cookie and return the authenticated admin.

    Raises ``401 Unauthorized`` if the cookie is missing, the token is invalid
    or expired, or the referenced admin no longer exists.
    """
    if not token:
        raise _CREDENTIALS_ERROR

    try:
        claims = decode_access_token(token)
    except jwt.InvalidTokenError as exc:  # covers expired & tampered tokens
        raise _CREDENTIALS_ERROR from exc

    username = claims.get("sub")
    if not username:
        raise _CREDENTIALS_ERROR

    admin = await auth_service.get_admin_by_username(username)
    if admin is None:
        raise _CREDENTIALS_ERROR

    return admin
