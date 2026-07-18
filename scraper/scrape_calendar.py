"""Scraper anual: calendarul ortodox → secțiunea „Anunțuri și evenimente”.

Preia de pe noutati-ortodoxe.ro calendarul pentru ANUL CURENT și ANUL URMĂTOR
(alege anul în formularul paginii — un GET cu ?year=YYYY, exact ce trimite
<select name="year"> — apoi așteaptă ~10 secunde înainte de extragere),
păstrează doar sărbătorile însemnate cu roșu (publicate cu ``holiday: true``,
ca site-ul să le poată afișa distinct) și le publică în datele site-ului:
întâi în Redis (``content:events`` — de aici citește pagina publică), apoi în
MongoDB (``site_content`` — persistența). Evenimentele adăugate de preot din
panoul de administrare (``source: "manual"``) sunt păstrate neatinse; doar cele
cu ``source: "calendar"`` sunt înlocuite cu varianta proaspăt extrasă.

Rulare unică, fără planificator propriu: programarea (cron) se face în
serviciul de deployment — vezi README.md. Rulările repetate sunt idempotente
(id-urile evenimentelor sunt deterministe: ``cal-YYYY-MM-DD``).

Structura paginii pe care ne bazăm (verificată la 2026-07-18):
    <div class="calendar" id="month1"> … <tr class="sarbatoare">
        <td class="ziua">6</td><td class="sapt">M</td>
        <td><a class="sinaxar" …>(†) Botezul Domnului …</a>
            <span class="comentariu">(…)</span></td>
    </tr> … </div>
Rândurile „sarbatoare” sunt zilele cu roșu; duminicile obișnuite au clasa
„sarbatoare saptamana” și sunt păstrate doar dacă textul poartă un însemn de
sărbătoare — „(†)” sau „†)”.
"""

from __future__ import annotations

import json
import logging
import os
import re
import sys
import time
from datetime import UTC, date, datetime
from pathlib import Path

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from pymongo import MongoClient
from redis import Redis

CALENDAR_URL = "https://www.noutati-ortodoxe.ro/calendar-ortodox/"
USER_AGENT = "Mozilla/5.0 (compatible; SantanaBisericaScraper/1.0; +site parohial Santana)"

CONTENT_COLLECTION = "site_content"
REDIS_KEY = "content:events"

# Limitele schemei EventItem din backend — payload-ul trebuie să treacă de ea.
TITLE_MAX = 90
DESC_MAX = 220

# Sub acest număr de sărbători extrase considerăm că structura paginii s-a
# schimbat și NU scriem nimic (mai bine date vechi decât date lipsă).
MIN_EXPECTED_EVENTS = 10

# Însemnele sărbătorilor din sinaxar: „(†)” (praznic mare) sau „†)” (cu cruce).
FEAST_MARKER = re.compile(r"\(†\)|†\)")
LEADING_MARKERS = re.compile(r"^\s*(\(†\)|†\)|†)\s*")

log = logging.getLogger("calendar_scraper")


# --- Extragere --------------------------------------------------------------

def get_with_retries(session: requests.Session, params: dict | None) -> str:
    """GET cu 3 încercări; erorile trecătoare de rețea nu opresc rularea."""
    last_error: Exception | None = None
    for attempt in range(1, 4):
        try:
            response = session.get(CALENDAR_URL, params=params, timeout=30)
            response.raise_for_status()
            return response.text
        except requests.RequestException as error:
            last_error = error
            log.warning("Încercarea %d a eșuat (%s); reîncerc...", attempt, error)
            time.sleep(5 * attempt)
    raise RuntimeError(f"Nu am putut descărca pagina: {last_error}")


def available_years(html: str) -> set[int]:
    """Anii din <select name="year"> — ca să nu cerem un an inexistent."""
    soup = BeautifulSoup(html, "lxml")
    select = soup.select_one('select[name="year"]')
    if select is None:
        return set()
    years = set()
    for option in select.select("option"):
        value = (option.get("value") or "").strip()
        if value.isdigit():
            years.add(int(value))
    return years


def normalize(text: str) -> str:
    return " ".join(text.split())


def strip_markers(segment: str) -> str:
    """Elimină însemnele „(†)” / „†)” / „†” de la începutul unui fragment."""
    previous = None
    while previous != segment:
        previous = segment
        segment = LEADING_MARKERS.sub("", segment)
    return segment.strip()


def truncate(text: str, limit: int) -> str:
    return text if len(text) <= limit else text[: limit - 1].rstrip() + "…"


def build_event(event_date: date, sinaxar: str, comments: list[str]) -> dict:
    """Un eveniment în forma cerută de schema EventItem a backend-ului.

    Tot ce extragem sunt zile însemnate cu roșu în calendar, deci fiecare
    poartă ``holiday: True`` — așa se deosebesc de anunțurile parohiei
    (``holiday: False``) în ambele interfețe.
    """
    parts = [part.strip() for part in sinaxar.split(";") if part.strip()]
    title = strip_markers(parts[0]) if parts else strip_markers(sinaxar)
    rest = "; ".join(strip_markers(part) for part in parts[1:])
    desc = " ".join(piece for piece in (rest, " ".join(comments).strip()) if piece)
    return {
        "id": f"cal-{event_date.isoformat()}",
        "date": event_date.isoformat(),
        "time": "",
        "title": truncate(title, TITLE_MAX),
        "desc": truncate(desc, DESC_MAX),
        "source": "calendar",
        "holiday": True,
    }


def parse_year(html: str, year: int) -> list[dict]:
    """Sărbătorile cu roșu dintr-o pagină de an (12 luni).

    HTML-ul sursă are celule <td>/<tr> neînchise; parserul „lxml” le închide
    corect (ca browserul) — cel implicit din Python le imbrică greșit.
    """
    soup = BeautifulSoup(html, "lxml")
    events: list[dict] = []

    for month_div in soup.select('div.calendar[id^="month"]'):
        try:
            month = int(month_div["id"].removeprefix("month"))
        except (KeyError, ValueError):
            continue

        for row in month_div.select("tr"):
            classes = row.get("class") or []
            if "sarbatoare" not in classes:
                continue
            day_cell = row.select_one("td.ziua")
            sinaxar_link = row.select_one("a.sinaxar")
            if day_cell is None or sinaxar_link is None:
                continue

            sinaxar = normalize(sinaxar_link.get_text(" ", strip=True))
            # Duminicile sunt oricum cu roșu („sarbatoare saptamana”); le păstrăm
            # doar când textul poartă un însemn real de sărbătoare.
            if "saptamana" in classes and not FEAST_MARKER.search(sinaxar):
                continue

            try:
                day = int(day_cell.get_text(strip=True))
                event_date = date(year, month, day)
            except ValueError:
                log.warning("Zi neinterpretabilă în luna %d: %r", month, day_cell.get_text())
                continue

            comments = [
                normalize(span.get_text(" ", strip=True))
                for span in row.select("span.comentariu")
            ]
            events.append(build_event(event_date, sinaxar, comments))

    return events


# --- Publicare (Redis, apoi MongoDB) ---------------------------------------

def publish(events: list[dict], mongo_url: str, redis_url: str, db_name: str) -> dict:
    """Îmbină sărbătorile cu evenimentele manuale existente și scrie ambele baze.

    Evenimentele ``source: "manual"`` rămân; cele ``source: "calendar"`` sunt
    înlocuite integral cu extragerea curentă (fără dubluri — id determinist).
    Sărbătorile deja trecute nu se mai publică.
    """
    mongo = MongoClient(mongo_url, serverSelectionTimeoutMS=8000)
    redis = Redis.from_url(redis_url, decode_responses=True)
    try:
        collection = mongo[db_name][CONTENT_COLLECTION]
        document = collection.find_one({"_id": "events"})
        existing = (document or {}).get("data", {}).get("events", [])
        manual = [event for event in existing if event.get("source") != "calendar"]

        today = date.today().isoformat()
        upcoming = [event for event in events if event["date"] >= today]

        merged = sorted(
            manual + upcoming,
            key=lambda event: (event["date"], event.get("time") or ""),
        )
        payload = {"events": merged}
        raw = json.dumps(payload, ensure_ascii=False)

        # Întâi Redis (sursa publică de citire), apoi MongoDB (persistența).
        redis.set(REDIS_KEY, raw)
        collection.update_one(
            {"_id": "events"},
            {"$set": {"data": payload, "updated_at": datetime.now(UTC)}},
            upsert=True,
        )
        return {
            "manual_pastrate": len(manual),
            "calendar_publicate": len(upcoming),
            "total": len(merged),
        }
    finally:
        redis.close()
        mongo.close()


# --- Rulare -----------------------------------------------------------------

def main() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
        datefmt="%H:%M:%S",
    )
    load_dotenv(Path(__file__).parent / ".env")

    mongo_url = os.getenv("MONGO_URL")
    redis_url = os.getenv("REDIS_URL")
    if not mongo_url or not redis_url:
        log.error("Lipsesc MONGO_URL / REDIS_URL din scraper/.env — mă opresc.")
        sys.exit(2)
    db_name = os.getenv("MONGO_DB_NAME", "santana_biserica")
    delay = float(os.getenv("SCRAPE_DELAY_SECONDS", "10"))

    session = requests.Session()
    session.headers["User-Agent"] = USER_AGENT

    log.info("Deschid pagina calendarului pentru a citi formularul de an...")
    base_html = get_with_retries(session, None)
    years = available_years(base_html)

    current_year = date.today().year
    scraped: dict[str, dict] = {}

    for year in (current_year, current_year + 1):
        if years and year not in years:
            log.warning("Anul %d nu există în formularul paginii — îl sar.", year)
            continue
        log.info("Selectez anul %d în formular (GET ?year=%d)...", year, year)
        html = get_with_retries(session, {"year": year})
        log.info("Aștept %.0f secunde să se așeze datele...", delay)
        time.sleep(delay)
        year_events = parse_year(html, year)
        log.info("Anul %d: %d sărbători extrase.", year, len(year_events))
        for event in year_events:
            scraped[event["id"]] = event

    if len(scraped) < MIN_EXPECTED_EVENTS:
        log.error(
            "Doar %d sărbători extrase (sub pragul de %d) — structura paginii "
            "s-a schimbat probabil. Nu scriu nimic în baze.",
            len(scraped),
            MIN_EXPECTED_EVENTS,
        )
        sys.exit(1)

    summary = publish(list(scraped.values()), mongo_url, redis_url, db_name)
    log.info(
        "Publicat: %d sărbători din calendar + %d evenimente manuale păstrate "
        "(total %d) — Redis și MongoDB sunt sincronizate.",
        summary["calendar_publicate"],
        summary["manual_pastrate"],
        summary["total"],
    )


if __name__ == "__main__":
    main()
