"""Persistence model for admin accounts (``admin_accounts`` collection).

Document shape:
    {
        "_id":           ObjectId,
        "username":      str,   # unique login handle
        "password_hash": str,   # bcrypt hash — never store plaintext
        "created_at":    datetime,
    }
"""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field

# Name of the MongoDB collection holding admin accounts.
COLLECTION_NAME = "admin_accounts"


class AdminAccount(BaseModel):
    """An admin account as stored in MongoDB."""

    model_config = ConfigDict(populate_by_name=True)

    id: str | None = Field(default=None, alias="_id")
    username: str
    password_hash: str

    @classmethod
    def from_document(cls, document: dict) -> AdminAccount:
        """Build a model from a raw Mongo document (stringifying ``_id``)."""
        data = dict(document)
        if "_id" in data:
            data["_id"] = str(data["_id"])
        return cls.model_validate(data)
