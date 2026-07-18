"""Rate limiting (slowapi).

A single ``Limiter`` keyed by client IP address and backed by the shared Redis
node, so counters are enforced across restarts and multiple backend instances.
Applied to auth routes via the ``@limiter.limit(...)`` decorator; registered on
the app (with its exception handler) in ``app.main``.
"""

from __future__ import annotations

from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings

limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=settings.resolved_rate_limit_storage_uri,
)
