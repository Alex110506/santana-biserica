"""Request/response schemas for the editable site content.

One model per section, mirroring the dashboard's client-side rules so the API
enforces them authoritatively (the frontend checks are UX, not security):
„Despre parohie” (rich text ≤ 550 plain chars, whitelisted tags only),
„Rânduiala săptămânii” (weekly/monthly cadence), „Galerie foto” (≤ 20 images),
„Preoți și cler” (only priest roles) and „Anunțuri și evenimente” (dated).
"""

from __future__ import annotations

import re
from datetime import date
from typing import Literal

import nh3
from pydantic import BaseModel, Field, field_validator, model_validator

# --- Despre parohie ---------------------------------------------------------

ABOUT_MAX_CHARS = 550
# Formatting the editor may produce; everything else is stripped server-side.
ALLOWED_ABOUT_TAGS = {"b", "strong", "i", "em", "u", "p", "div", "br"}


def sanitize_about_html(html: str) -> str:
    """Keep only whitelisted inline tags, drop every attribute."""
    return nh3.clean(html, tags=ALLOWED_ABOUT_TAGS, attributes={})


def plain_text_length(html: str) -> int:
    """Length of the text content once all markup is removed."""
    return len(nh3.clean(html, tags=set(), attributes={}))


class AboutContent(BaseModel):
    """„Despre parohie” — section title plus limited rich text."""

    title: str = Field(min_length=1, max_length=90)
    html: str = Field(max_length=8_000)  # raw ceiling; real limit is plain text

    @field_validator("html")
    @classmethod
    def _sanitize_and_limit(cls, value: str) -> str:
        cleaned = sanitize_about_html(value)
        if plain_text_length(cleaned) > ABOUT_MAX_CHARS:
            raise ValueError(f"textul depășește {ABOUT_MAX_CHARS} de caractere")
        return cleaned


# --- Rânduiala săptămânii ---------------------------------------------------

TIME_PATTERN = r"^([01]\d|2[0-3]):[0-5]\d$"


class ScheduleItem(BaseModel):
    """A recurring service: weekly (one or more days) or monthly (rarest)."""

    id: str = Field(min_length=1, max_length=64)
    name: str = Field(min_length=1, max_length=80)
    time: str = Field(pattern=TIME_PATTERN)
    frequency: Literal["weekly", "monthly"]
    days: list[int] = Field(default_factory=list, max_length=7)
    ordinal: Literal["prima", "a doua", "a treia", "a patra", "ultima"] = "prima"
    weekday: int = Field(default=0, ge=0, le=6)

    @field_validator("days")
    @classmethod
    def _valid_days(cls, value: list[int]) -> list[int]:
        if any(day < 0 or day > 6 for day in value):
            raise ValueError("zilele săptămânii sunt între 0 (duminică) și 6")
        return sorted(set(value))

    @model_validator(mode="after")
    def _weekly_needs_days(self) -> ScheduleItem:
        if self.frequency == "weekly" and not self.days:
            raise ValueError("o slujbă săptămânală are nevoie de cel puțin o zi")
        return self


class ScheduleContent(BaseModel):
    """„Rânduiala săptămânii” payload."""

    items: list[ScheduleItem] = Field(max_length=50)


# --- Galerie foto -----------------------------------------------------------

MAX_GALLERY_IMAGES = 20


class GalleryImage(BaseModel):
    """A stored gallery image reference (URL lives in R2)."""

    id: str = Field(min_length=1, max_length=64)
    url: str = Field(min_length=1, max_length=500)
    caption: str = Field(default="", max_length=120)


class GalleryContent(BaseModel):
    """„Galerie foto” payload — order of ``images`` is the display order."""

    images: list[GalleryImage] = Field(max_length=MAX_GALLERY_IMAGES)


class GalleryUploadResponse(BaseModel):
    """Returned after files were uploaded to R2 and persisted."""

    status: Literal["success"] = "success"
    images: list[GalleryImage]


# --- Preoți și cler ---------------------------------------------------------


class ClergyMember(BaseModel):
    """Only priests are shown on the site — the roles are a closed set."""

    id: str = Field(min_length=1, max_length=64)
    name: str = Field(min_length=1, max_length=80)
    role: Literal["Preot paroh", "Preot slujitor"]


class ClergyContent(BaseModel):
    """„Preoți și cler” payload."""

    members: list[ClergyMember] = Field(max_length=20)


# --- Anunțuri și evenimente -------------------------------------------------


class EventItem(BaseModel):
    """A dated event; ``source`` separates admin entries from scraper ones.

    ``holiday`` marks the red-letter days of the church calendar (sărbătorile
    importante) so the frontend can render them distinctly from the parish's
    own announcements.
    """

    id: str = Field(min_length=1, max_length=64)
    date: str
    time: str = ""
    title: str = Field(min_length=1, max_length=90)
    desc: str = Field(default="", max_length=220)
    source: Literal["manual", "calendar"] = "manual"
    holiday: bool = False

    @field_validator("date")
    @classmethod
    def _iso_date(cls, value: str) -> str:
        date.fromisoformat(value)  # raises ValueError on bad input
        return value

    @field_validator("time")
    @classmethod
    def _time_or_empty(cls, value: str) -> str:
        if value and not re.fullmatch(TIME_PATTERN, value):
            raise ValueError("ora trebuie să fie în formatul HH:MM")
        return value


class EventsContent(BaseModel):
    """„Anunțuri și evenimente” payload."""

    events: list[EventItem] = Field(max_length=500)
