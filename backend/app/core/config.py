"""Application configuration.

Settings are loaded from environment variables (and the local ``.env`` file in
development) via ``pydantic-settings``. Import the singleton ``settings`` object
anywhere configuration is needed.
"""

from functools import lru_cache
from typing import Literal
from urllib.parse import urlparse


from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Strongly-typed application settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- App metadata ---
    app_name: str = "Santana Biserica API"
    environment: str = "development"
    debug: bool = True

    # --- External services (see architecture.svg) ---
    # MongoDB: primary NoSQL datastore for CMS collections.
    mongo_url: str
    mongo_db_name: str = "santana_biserica"

    # Redis: in-memory cache shared with the scraper node.
    redis_url: str

    # --- Authentication (JWT in an httpOnly cookie) ---
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    # Access-token / cookie lifetime, in days.
    jwt_expiry_days: int = 7

    # Cookie behaviour. For a cross-site prod deployment (frontend and backend
    # on different domains) the browser only sends the cookie when it is
    # `SameSite=None; Secure`. On localhost, `lax` + insecure works over http.
    auth_cookie_name: str = "sb_admin_token"
    cookie_secure: bool = True
    cookie_samesite: Literal["lax", "strict", "none"] = "none"
    # Optional cookie domain (e.g. ".example.com"); leave empty for host-only.
    cookie_domain: str | None = None

    # --- Object storage (Cloudflare R2, S3-compatible) ---
    # Endpoint incl. the bucket path, e.g.
    # "https://<account>.r2.cloudflarestorage.com/<bucket>".
    s3_api_url: str = ""
    # R2 API token credentials (S3 auth pair). Required for uploads.
    s3_access_key_id: str = ""
    s3_secret_access_key: str = ""
    # Public base URL that serves the bucket (r2.dev subdomain or custom
    # domain), e.g. "https://pub-xxxxxxxx.r2.dev". Required for uploads.
    s3_public_base_url: str = ""
    s3_region: str = "auto"

    # --- Uploads ---
    # Per-file ceiling for gallery uploads, in bytes (10 MB).
    max_upload_bytes: int = 10 * 1024 * 1024

    # --- Rate limiting (slowapi) ---
    # Limit applied to the auth endpoints, keyed by client IP.
    auth_rate_limit: str = "5/hour"
    # Public content reads / admin content writes, keyed by client IP.
    # slowapi scopes counters per route, so "per route" comes for free.
    content_read_rate_limit: str = "30/minute"
    content_write_rate_limit: str = "10/hour"
    # Storage for rate-limit counters. Defaults to the shared Redis node so the
    # limit holds across restarts and multiple backend instances. Set to
    # "memory://" to keep counters in-process instead.
    rate_limit_storage_uri: str | None = None

    # --- CORS ---
    # Frontend origins allowed to call the API with credentials. Comma-separated
    # in the environment (e.g. "http://localhost:5173,https://example.com").
    cors_origins: list[str] = [
        "https://parohia-santana-1.ro",
        "https://www.parohia-santana-1.ro",
        "http://localhost:5173",
    ]

    @property
    def resolved_rate_limit_storage_uri(self) -> str:
        """Storage URI for the rate limiter (falls back to Redis)."""
        return self.rate_limit_storage_uri or self.redis_url

    @property
    def s3_endpoint_url(self) -> str:
        """S3 endpoint without the bucket path (boto wants them separate)."""
        parsed = urlparse(self.s3_api_url)
        return f"{parsed.scheme}://{parsed.netloc}" if parsed.netloc else ""

    @property
    def s3_bucket(self) -> str:
        """Bucket name, taken from the path of ``s3_api_url``."""
        return urlparse(self.s3_api_url).path.strip("/")

    @property
    def s3_configured(self) -> bool:
        """Whether every setting needed for gallery uploads is present."""
        return bool(
            self.s3_endpoint_url
            and self.s3_bucket
            and self.s3_access_key_id
            and self.s3_secret_access_key
            and self.s3_public_base_url
        )




@lru_cache
def get_settings() -> Settings:
    """Return a cached ``Settings`` instance (read the environment only once)."""
    return Settings()  # type: ignore[call-arg]


settings = get_settings()
