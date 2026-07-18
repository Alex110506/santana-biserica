"""Controllers orchestrate the request/response cycle for a resource.

They translate between the HTTP layer (routes) and the service layer, deciding
on status codes and shaping responses, while delegating real work to services.
"""

from __future__ import annotations

from fastapi import Response, status

from app.schemas.health import HealthResponse, Status
from app.services import health_service


async def health_check(response: Response) -> HealthResponse:
    """Return the aggregated health report.

    Responds ``503 Service Unavailable`` when any dependency is unhealthy so
    that upstream load balancers / uptime probes can react accordingly.
    """
    report = await health_service.get_health()
    if report.status is not Status.OK:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return report
