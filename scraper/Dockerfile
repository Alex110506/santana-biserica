# ──────────────────────────────────────────────────────────────
# santana-biserica-scraper  — lightweight container image
# Uses uv for fast, reproducible dependency resolution.
# ──────────────────────────────────────────────────────────────

FROM python:3.12-slim AS base

# Prevent Python from buffering stdout/stderr (important for
# Docker logs) and from writing .pyc files inside the container.
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# ── Install uv ──────────────────────────────────────────────
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/

# ── Dependency layer (cached unless lock/pyproject change) ──
COPY pyproject.toml uv.lock ./

RUN uv sync --frozen --no-dev --no-install-project

# ── Application code ────────────────────────────────────────
COPY scrape_calendar.py ./

# ── Runtime ─────────────────────────────────────────────────
# Environment variables (MONGO_URL, REDIS_URL, etc.) should be
# injected at runtime via `docker run --env-file .env` or
# docker-compose environment / env_file directives.

CMD ["uv", "run", "--frozen", "--no-dev", "python", "scrape_calendar.py"]
