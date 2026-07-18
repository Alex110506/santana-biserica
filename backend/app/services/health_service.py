"""Business logic for health checks.

Services own the actual work (here: probing external dependencies) and are kept
free of HTTP concerns so they can be reused and unit-tested in isolation.
"""

from __future__ import annotations

from app.core.config import settings
from app.db.mongo import get_client
from app.db.redis import get_redis
from app.schemas.health import DependencyHealth, HealthResponse, Status


async def _check_mongo() -> DependencyHealth:
    """Ping MongoDB and report its status."""
    try:
        await get_client().admin.command("ping")
        return DependencyHealth(status=Status.OK)
    except Exception as exc:  # noqa: BLE001 - surface any failure as "down"
        return DependencyHealth(status=Status.DOWN, detail=str(exc))


async def _check_redis() -> DependencyHealth:
    """Ping Redis and report its status."""
    try:
        await get_redis().ping()
        return DependencyHealth(status=Status.OK)
    except Exception as exc:  # noqa: BLE001 - surface any failure as "down"
        return DependencyHealth(status=Status.DOWN, detail=str(exc))


async def get_health() -> HealthResponse:
    """Aggregate the health of the API and its external dependencies."""
    dependencies = {
        "mongodb": await _check_mongo(),
        "redis": await _check_redis(),
    }

    overall = (
        Status.OK
        if all(dep.status is Status.OK for dep in dependencies.values())
        else Status.DEGRADED
    )

    return HealthResponse(
        status=overall,
        service=settings.app_name,
        environment=settings.environment,
        dependencies=dependencies,
    )
