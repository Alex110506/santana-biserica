"""Content routes: one GET per section (public) and one POST per section
(admin-only).

Rate limits, keyed by client IP and scoped per route by slowapi:
reads ``settings.content_read_rate_limit`` (30/minute), writes
``settings.content_write_rate_limit`` (10/hour).
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, File, Request, UploadFile

from app.api.deps import get_current_admin
from app.controllers import content_controller
from app.core.config import settings
from app.core.rate_limit import limiter
from app.models.admin import AdminAccount
from app.schemas.content import (
    AboutContent,
    ClergyContent,
    EventsContent,
    GalleryContent,
    GalleryUploadResponse,
    ScheduleContent,
)
from app.services import content_service

router = APIRouter(prefix="/content", tags=["content"])

READ_LIMIT = settings.content_read_rate_limit
WRITE_LIMIT = settings.content_write_rate_limit


# --- Despre parohie ---------------------------------------------------------

@router.get("/about", response_model=AboutContent, summary="Conținutul „Despre parohie”")
@limiter.limit(READ_LIMIT)
async def get_about(request: Request) -> dict:
    return await content_controller.get_simple_section(content_service.SECTION_ABOUT)


@router.post("/about", response_model=AboutContent, summary="Salvează „Despre parohie”")
@limiter.limit(WRITE_LIMIT)
async def save_about(
    request: Request,
    payload: AboutContent,
    admin: AdminAccount = Depends(get_current_admin),
) -> AboutContent:
    return await content_controller.save_about(payload)


# --- Rânduiala săptămânii ---------------------------------------------------

@router.get("/schedule", response_model=ScheduleContent, summary="Rânduiala săptămânii")
@limiter.limit(READ_LIMIT)
async def get_schedule(request: Request) -> dict:
    return await content_controller.get_simple_section(content_service.SECTION_SCHEDULE)


@router.post("/schedule", response_model=ScheduleContent, summary="Salvează rânduiala")
@limiter.limit(WRITE_LIMIT)
async def save_schedule(
    request: Request,
    payload: ScheduleContent,
    admin: AdminAccount = Depends(get_current_admin),
) -> ScheduleContent:
    return await content_controller.save_schedule(payload)


# --- Galerie foto -----------------------------------------------------------

@router.get("/gallery", response_model=GalleryContent, summary="Galeria foto")
@limiter.limit(READ_LIMIT)
async def get_gallery(request: Request) -> dict:
    return await content_controller.get_gallery()


@router.post(
    "/gallery",
    response_model=GalleryContent,
    summary="Salvează galeria (descrieri, ordine, ștergeri)",
)
@limiter.limit(WRITE_LIMIT)
async def save_gallery(
    request: Request,
    payload: GalleryContent,
    admin: AdminAccount = Depends(get_current_admin),
) -> GalleryContent:
    return await content_controller.save_gallery(payload)


@router.post(
    "/gallery/images",
    response_model=GalleryUploadResponse,
    summary="Încarcă imagini în galerie (R2)",
)
@limiter.limit(WRITE_LIMIT)
async def upload_gallery_images(
    request: Request,
    files: list[UploadFile] = File(...),
    admin: AdminAccount = Depends(get_current_admin),
) -> GalleryUploadResponse:
    return await content_controller.upload_gallery_images(files)


# --- Preoți și cler ---------------------------------------------------------

@router.get("/clergy", response_model=ClergyContent, summary="Preoți și cler")
@limiter.limit(READ_LIMIT)
async def get_clergy(request: Request) -> dict:
    return await content_controller.get_simple_section(content_service.SECTION_CLERGY)


@router.post("/clergy", response_model=ClergyContent, summary="Salvează clerul")
@limiter.limit(WRITE_LIMIT)
async def save_clergy(
    request: Request,
    payload: ClergyContent,
    admin: AdminAccount = Depends(get_current_admin),
) -> ClergyContent:
    return await content_controller.save_clergy(payload)


# --- Anunțuri și evenimente -------------------------------------------------

@router.get("/events", response_model=EventsContent, summary="Anunțuri și evenimente")
@limiter.limit(READ_LIMIT)
async def get_events(request: Request) -> dict:
    return await content_controller.get_simple_section(content_service.SECTION_EVENTS)


@router.post("/events", response_model=EventsContent, summary="Salvează evenimentele")
@limiter.limit(WRITE_LIMIT)
async def save_events(
    request: Request,
    payload: EventsContent,
    admin: AdminAccount = Depends(get_current_admin),
) -> EventsContent:
    return await content_controller.save_events(payload)
