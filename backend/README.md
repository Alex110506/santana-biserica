# Santana Biserica — Backend

FastAPI backend (CMS API) for the Sântana church website. Connects to an
external **MongoDB** instance (primary datastore) and a **Redis** node
(in-memory cache shared with the scraper), per `../architecture.svg`.

## Stack

- **FastAPI** + **Uvicorn** — async web framework / ASGI server
- **PyMongo** (native async `AsyncMongoClient`) — MongoDB driver
- **redis-py** (`redis.asyncio`) — Redis client
- **pydantic-settings** — typed configuration from the environment
- **uv** — dependency & environment management

## Project layout

```
app/
├── main.py                 # app factory + FastAPI instance (+ CORS)
├── core/
│   ├── config.py           # settings loaded from env / .env
│   ├── security.py         # password hashing (bcrypt) + JWT encode/decode
│   └── lifespan.py         # startup/shutdown: open & close connections
├── db/
│   ├── mongo.py            # MongoDB client (connect/close/accessors)
│   └── redis.py            # Redis client (connect/close/accessor)
├── api/
│   ├── router.py           # aggregates all route modules
│   ├── deps.py             # get_current_admin — JWT-cookie guard
│   └── routes/
│       ├── health.py       # health route
│       └── auth.py         # login / logout / me
├── controllers/            # request/response orchestration, status codes
├── services/               # business logic (auth, dependency probing…)
├── schemas/                # Pydantic request/response models
└── models/                 # persistence models (MongoDB documents)
```

Request flow: **route → controller → service → db**.

## Authentication

Admin login is cookie-based JWT:

1. `POST /auth/login` `{username, password}` — verifies the credentials against
   the `admin_accounts` collection (passwords stored as **bcrypt** hashes) and,
   on success, sets a **7-day httpOnly cookie** (`sb_admin_token`) holding the
   signed JWT. The token is never returned in the body.
2. `GET /auth/me` — returns the current admin; protected by the
   `get_current_admin` dependency (the JWT-verification "middleware").
3. `POST /auth/logout` — clears the cookie.

Protect any future admin route with the dependency:

```python
from fastapi import Depends
from app.api.deps import get_current_admin

@router.get("/admin/thing")
async def read(admin = Depends(get_current_admin)): ...

# …or a whole router at once:
APIRouter(prefix="/admin", dependencies=[Depends(get_current_admin)])
```

Create an admin account:

```bash
uv run python -m scripts.create_admin --username admin --password 'your-password'
```

## Setup

```bash
# Install dependencies into a local .venv
uv sync

# Configure environment (real values already provided in .env)
cp .env.example .env   # if you don't have one yet
```

## Run

```bash
uv run uvicorn app.main:app --reload
```

- API docs: http://127.0.0.1:8000/docs
- Health check: http://127.0.0.1:8000/health

The `/health` endpoint pings both MongoDB and Redis and returns `503` if any
dependency is unreachable.
