# Scraper — calendarul ortodox

Nodul „scraper” al site-ului parohial: preia anual sărbătorile din
[calendarul ortodox](https://www.noutati-ortodoxe.ro/calendar-ortodox/) pentru
**anul curent și anul următor** și le publică în secțiunea „Anunțuri și
evenimente” a site-ului — întâi în **Redis** (`content:events`, de unde citește
pagina publică), apoi în **MongoDB** (`site_content`, persistența).

Ce face, pe scurt:

1. Deschide pagina calendarului și citește formularul de an
   (`<select name="year">`).
2. „Selectează” anul curent (GET `?year=YYYY` — exact cererea pe care o trimite
   formularul), așteaptă ~10 secunde, apoi extrage sărbătorile; repetă pentru
   anul următor.
3. Păstrează doar zilele cu roșu (`<tr class="sarbatoare">`); duminicile
   obișnuite sunt sărite dacă nu poartă un însemn de sărbătoare — „(†)” sau „†)”.
4. Îmbină rezultatul cu evenimentele existente: cele adăugate de preot din
   panou (`source: "manual"`) **rămân neatinse**, cele `source: "calendar"`
   sunt înlocuite cu extragerea proaspătă. Sărbătorile deja trecute nu se mai
   publică.
5. Scrie totul în Redis și MongoDB, sincronizate.

Rulările repetate sunt **idempotente** (id-uri deterministe `cal-YYYY-MM-DD`),
iar dacă pagina își schimbă structura și extragerea iese sub prag, scriptul
**nu scrie nimic** și iese cu cod de eroare (datele vechi rămân în picioare).

## Configurare

`scraper/.env`:

```
MONGO_URL=...                # obligatoriu
REDIS_URL=...                # obligatoriu
MONGO_DB_NAME=santana_biserica   # opțional (implicit)
SCRAPE_DELAY_SECONDS=10          # opțional (implicit 10)
```

Instalare și rulare manuală:

```bash
cd scraper
uv sync
uv run python scrape_calendar.py
```

## Programare (cron — în serviciul de deployment, nu în cod)

Scriptul rulează o singură dată și se oprește; planificarea anuală se face din
platforma de deployment. Exemple:

- **crontab clasic** (2 ianuarie, ora 04:00, în fiecare an):

  ```cron
  0 4 2 1 * cd /calea/catre/scraper && uv run python scrape_calendar.py
  ```

- **Render / Railway (Cron Job)** — schedule `0 4 2 1 *`, comanda
  `python scrape_calendar.py` (cu dependențele instalate la build:
  `pip install -r <(uv export --no-dev)` sau `uv sync`).

Poate fi rulat oricând și mai des (de exemplu lunar) fără efecte secundare —
util și ca plasă de siguranță dacă o rulare anuală pică.
