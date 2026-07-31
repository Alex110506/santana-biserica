"""Request/response schemas for the editable site content.

One model per section, mirroring the dashboard's client-side rules so the API
enforces them authoritatively (the frontend checks are UX, not security):
„Despre parohie” (rich text ≤ 14000 plain chars ≈ 2000 words, whitelisted tags only),
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

# ~2000 words of Romanian prose; plain-text length is what's enforced below.
ABOUT_MAX_CHARS = 14_000
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
    html: str = Field(max_length=80_000)  # raw ceiling; real limit is plain text

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

CLERGY_MIN_YEAR = 1700
CLERGY_MAX_YEAR = 2100


class ClergyMember(BaseModel):
    """Only priests are shown on the site — the roles are a closed set.

    Each priest also carries the years of his ministry at the parish:
    ``startYear`` (when he began) and either ``endYear`` (when he left) or
    ``current=True`` — „încă în funcție”, still serving. The public page orders
    priests chronologically by ``startYear`` and shows the period under the role.
    """

    id: str = Field(min_length=1, max_length=64)
    name: str = Field(min_length=1, max_length=80)
    role: Literal["Preot paroh", "Preot slujitor"]
    startYear: int | None = Field(default=None, ge=CLERGY_MIN_YEAR, le=CLERGY_MAX_YEAR)
    endYear: int | None = Field(default=None, ge=CLERGY_MIN_YEAR, le=CLERGY_MAX_YEAR)
    current: bool = False

    @model_validator(mode="after")
    def _validate_years(self) -> ClergyMember:
        # „Încă în funcție” and an explicit end year are mutually exclusive —
        # the flag wins and clears any end year.
        if self.current:
            self.endYear = None
        elif self.endYear is not None:
            if self.startYear is None:
                raise ValueError("anul de final are nevoie de un an de început")
            if self.endYear < self.startYear:
                raise ValueError("anul de final nu poate fi înaintea celui de început")
        return self


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
