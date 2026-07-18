"""Authentication business logic.

Looks admins up in the ``admin_accounts`` MongoDB collection, verifies their
password, and issues JWTs. Free of HTTP concerns so the controller and the
JWT-verifying dependency can both reuse it.
"""

from __future__ import annotations

from app.core.security import create_access_token, verify_password
from app.db.mongo import get_database
from app.models.admin import COLLECTION_NAME, AdminAccount


async def get_admin_by_username(username: str) -> AdminAccount | None:
    """Fetch a single admin by username, or ``None`` if not found."""
    document = await get_database()[COLLECTION_NAME].find_one({"username": username})
    if document is None:
        return None
    return AdminAccount.from_document(document)


async def authenticate(username: str, password: str) -> AdminAccount | None:
    """Return the admin if the credentials are valid, otherwise ``None``.

    Always runs a password verification (even when the user is missing) to keep
    the timing similar and avoid leaking which usernames exist.
    """
    admin = await get_admin_by_username(username)
    # Dummy hash used when the account does not exist, to avoid a fast/early
    # return that would reveal (via timing) whether the username was valid.
    stored_hash = admin.password_hash if admin else _DUMMY_HASH

    if not verify_password(password, stored_hash):
        return None
    return admin


def issue_token(admin: AdminAccount) -> str:
    """Create a signed JWT for the given admin."""
    return create_access_token(admin.username)


# A pre-computed bcrypt hash of a random string, used only to equalise timing
# for unknown usernames (see ``authenticate``). It matches no real password.
_DUMMY_HASH = "$2b$12$C6UzMDM.H6dfI/f/IKcEeO3S9nZ0Q3nQ0f4o0nJ8b2kq0Y0oQx8W"
