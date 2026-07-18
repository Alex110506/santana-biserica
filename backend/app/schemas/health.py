"""Pydantic schemas for the health check response."""

from __future__ import annotations

from enum import StrEnum

from pydantic import BaseModel


class Status(StrEnum):
    """Coarse health status for the service and its dependencies."""

    OK = "ok"
    DEGRADED = "degraded"
    DOWN = "down"


class DependencyHealth(BaseModel):
    """Health of a single external dependency."""

    status: Status
    detail: str | None = None


class HealthResponse(BaseModel):
    """Aggregated health of the API and its external dependencies."""

    status: Status
    service: str
    environment: str
    dependencies: dict[str, DependencyHealth]
