# Parichay API (Backend)

FastAPI + PostgreSQL + SQLAlchemy backend for the Parichay digital business
card app.

## Features

- JWT auth (access + refresh tokens)
- Digital card (Profile) CRUD with auto-generated unique slug + QR payload
- Avatar upload
- Save a contact by scanning another user's QR (`/connections/from-profile`)
- AI business-card scanner: upload a photo → OCR extraction → review → save
  (`/connections/scan` then `/connections/from-scan`)
- Tag/search contacts, quick-action-ready fields (phone/email/website)

## 1. Prerequisites

- Python 3.11+
- PostgreSQL running locally (matches your existing local setup)
- Tesseract OCR engine installed on the host (required by `pytesseract`):
  - macOS: `brew install tesseract`
  - Ubuntu/Debian: `sudo apt-get install tesseract-ocr`
  - Windows: install from https://github.com/UB-Mannheim/tesseract/wiki

## 2. Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# edit .env with your local Postgres credentials + a real SECRET_KEY

# create the database once, e.g.:
createdb parichay
```

## 3. Run

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Swagger UI: http://localhost:8000/docs
- The app auto-creates tables on startup via `Base.metadata.create_all`
  (MVP-speed). For production, switch to Alembic migrations:
  `alembic revision --autogenerate -m "init"` then `alembic upgrade head`,
  and remove the `create_all` call in `app/main.py`.

## 4. Connecting from Expo Go

Expo Go runs on a physical device/simulator, not `localhost` of your laptop.
Use your machine's LAN IP as the API base URL in the frontend `.env`
(e.g. `http://192.168.1.50:8000/api/v1`), and make sure your firewall allows
inbound connections on port 8000.

## 5. Project layout

See `app/` - layered as `api` (routes) → `crud` (business logic) → `models`
(SQLAlchemy) with `schemas` (Pydantic) as the I/O contract. Add new
resources by creating a model, schema, crud module, and endpoint module,
then registering the router in `app/api/v1/api.py`.
