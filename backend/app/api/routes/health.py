"""Health check route definitions."""

from __future__ import annotations

from fastapi import APIRouter

from app.controllers import health_controller
from app.schemas.health import HealthResponse

router = APIRouter(tags=["health"])

router.add_api_route(
    "/health",
    health_controller.health_check,
    methods=["GET"],
    response_model=HealthResponse,
    summary="Service health check",
    description="Reports API status and the reachability of MongoDB and Redis.",
)
