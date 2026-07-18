"""Content controllers: HTTP orchestration for the editable site sections.

Reads are public (Redis-first). Writes come from the admin dashboard, are
guarded by ``get_current_admin`` at the route layer, and land in MongoDB and
Redis together. Error details are in Romanian — the dashboard shows them
verbatim to the (Romanian-speaking) admin.
"""

from __future__ import annotations

from fastapi import HTTPException, UploadFile, status

from app.core.config import settings
from app.schemas.content import (
    MAX_GALLERY_IMAGES,
    AboutContent,
    ClergyContent,
    EventsContent,
    GalleryContent,
    GalleryImage,
    GalleryUploadResponse,
    ScheduleContent,
)
from app.services import content_service, gallery_service
from app.services.gallery_service import ALLOWED_IMAGE_TYPES

_NOT_PUBLISHED = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="Această secțiune nu a fost încă publicată.",
)


# --- Simple sections (about / schedule / clergy / events) -------------------

async def get_simple_section(section: str) -> dict:
    """Payload of a ``site_content`` section, or 404 if never saved."""
    data = await content_service.get_section(section)
    if data is None:
        raise _NOT_PUBLISHED
    return data


async def save_about(payload: AboutContent) -> AboutContent:
    await content_service.save_section(content_service.SECTION_ABOUT, payload.model_dump())
    return payload


async def save_schedule(payload: ScheduleContent) -> ScheduleContent:
    await content_service.save_section(content_service.SECTION_SCHEDULE, payload.model_dump())
    return payload


async def save_clergy(payload: ClergyContent) -> ClergyContent:
    await content_service.save_section(content_service.SECTION_CLERGY, payload.model_dump())
    return payload


async def save_events(payload: EventsContent) -> EventsContent:
    await content_service.save_section(content_service.SECTION_EVENTS, payload.model_dump())
    return payload


# --- Gallery ----------------------------------------------------------------

async def get_gallery() -> dict:
    data = await gallery_service.get_gallery()
    if data is None:
        raise _NOT_PUBLISHED
    return data


async def upload_gallery_images(files: list[UploadFile]) -> GalleryUploadResponse:
    """Validate the uploaded files and push them through the R2 flow."""
    if not settings.s3_configured:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Stocarea imaginilor nu este configurată pe server "
                "(lipsesc S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY sau "
                "S3_PUBLIC_BASE_URL din backend/.env)."
            ),
        )
    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nu a fost trimis niciun fișier.",
        )

    existing = await gallery_service.count_images()
    if existing + len(files) > MAX_GALLERY_IMAGES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Galeria poate avea cel mult {MAX_GALLERY_IMAGES} de imagini "
                f"(există deja {existing})."
            ),
        )

    payloads: list[tuple[bytes, str]] = []
    for file in files:
        content_type = (file.content_type or "").lower()
        if content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"„{file.filename}” nu este acceptat — doar JPG, PNG sau WebP.",
            )
        data = await file.read()
        if not data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"„{file.filename}” este gol.",
            )
        if len(data) > settings.max_upload_bytes:
            limit_mb = settings.max_upload_bytes // (1024 * 1024)
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"„{file.filename}” depășește limita de {limit_mb} MB.",
            )
        payloads.append((data, content_type))

    images = await gallery_service.upload_images(payloads)
    return GalleryUploadResponse(images=[GalleryImage(**image) for image in images])


async def save_gallery(payload: GalleryContent) -> GalleryContent:
    """Persist captions/order and delete the images left out of the list."""
    try:
        images = await gallery_service.save_gallery(
            [image.model_dump() for image in payload.images]
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc
    return GalleryContent(images=[GalleryImage(**image) for image in images])
