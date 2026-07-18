"""Security primitives: password hashing and JWT encoding/decoding.

Kept free of any web/database concerns so it can be unit-tested in isolation and
reused (e.g. by the admin-seeding script).
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

import bcrypt
import jwt

from app.core.config import settings

# --- Password hashing (bcrypt) ---------------------------------------------

def hash_password(password: str) -> str:
    """Return a bcrypt hash of ``password`` (safe to store in the database)."""
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    """Return whether ``password`` matches the stored bcrypt ``password_hash``."""
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except (ValueError, TypeError):
        # Malformed/empty hash in the database — treat as a failed check.
        return False


# --- JSON Web Tokens --------------------------------------------------------

def create_access_token(subject: str, *, extra_claims: dict | None = None) -> str:
    """Create a signed JWT for ``subject`` (the admin username / id).

    Includes standard ``sub``, ``iat`` and ``exp`` claims; ``exp`` is set from
    ``settings.jwt_expiry_days`` (7 days by default).
    """
    now = datetime.now(UTC)
    payload: dict = {
        "sub": subject,
        "iat": now,
        "exp": now + timedelta(days=settings.jwt_expiry_days),
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict:
    """Decode and validate a JWT, returning its claims.

    Raises ``jwt.InvalidTokenError`` (or a subclass such as
    ``ExpiredSignatureError``) if the token is invalid, tampered, or expired.
    """
    return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
