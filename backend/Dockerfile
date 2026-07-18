# ---- Build stage ----
# Install dependencies in a temporary image so the final image stays lean.
FROM python:3.12-slim AS builder

# Install uv (fast Python package manager).
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/

# Use /app as WORKDIR in both stages so that the venv shebangs
# (e.g. #!/app/.venv/bin/python) resolve correctly in the runtime image.
WORKDIR /app

# Copy only dependency files first to maximise Docker layer caching.
COPY pyproject.toml uv.lock ./

# Install production dependencies into /app/.venv.
# --frozen ensures the lockfile is used exactly as-is.
RUN uv sync --frozen --no-dev --no-install-project

# Copy the application source.
COPY app/ app/
COPY scripts/ scripts/

# ---- Runtime stage ----
FROM python:3.12-slim AS runtime

# Don't buffer stdout/stderr so logs appear immediately.
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Create a non-root user for security.
RUN groupadd --system app && useradd --system --gid app app

WORKDIR /app

# Bring in the virtual-env and source from the builder.
COPY --from=builder /app/.venv /app/.venv
COPY --from=builder /app/app   /app/app
COPY --from=builder /app/scripts /app/scripts
COPY --from=builder /app/pyproject.toml /app/pyproject.toml

# Put the venv's Python and binaries on PATH.
ENV PATH="/app/.venv/bin:$PATH"

# Switch to non-root user.
USER app

EXPOSE 8000

# Start the ASGI server.
# Use 0.0.0.0 so the container is reachable from outside.
# Proxy-headers trusts X-Forwarded-* from a reverse proxy (Railway, etc.).
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers"]