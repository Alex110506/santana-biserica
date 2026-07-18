"""Request/response schemas for authentication."""

from __future__ import annotations

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    """Credentials submitted by the login form."""

    username: str = Field(min_length=1, max_length=150)
    password: str = Field(min_length=1, max_length=256)


class AdminPublic(BaseModel):
    """Non-sensitive admin details returned to the client.

    Never includes the password hash. The JWT itself is delivered via an
    httpOnly cookie, not in the response body.
    """

    username: str


class LoginResponse(BaseModel):
    """Body returned on a successful login."""

    admin: AdminPublic


class MessageResponse(BaseModel):
    """Generic acknowledgement (e.g. for logout)."""

    detail: str
