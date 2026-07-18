# Parichay ~ Digital Business Card App (MVP)

An implementation of an existing digital business card & networking app
called Azlogics' Parichay on Google Play, built with:

- **Backend:** FastAPI + PostgreSQL + SQLAlchemy 2.0, JWT auth
- **Frontend:** React Native + Expo (Router, Paper, React Query, RHF, Reanimated)

```
parichay/
├── backend/     FastAPI API — see backend/README.md
└── frontend/    Expo app (runs in Expo Go) — see frontend/README.md
```

## Quick start

1. **Backend** — get the API running first (the app has nothing to talk to
   otherwise):
   ```bash
   cd backend
   python -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   cp .env.example .env   # edit with your local Postgres credentials
   createdb parichay
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Frontend:**
   ```bash
   cd frontend
   npm install
   cp .env.example .env   # set EXPO_PUBLIC_API_URL to your LAN IP:8000
   npx expo start
   ```
   Scan the QR with Expo Go.

## What's implemented

| Feature | Backend | Frontend |
|---|---|---|
| Register / login (JWT + refresh) | ✅ | ✅ |
| Digital card CRUD + avatar upload | ✅ | ✅ |
| Auto-generated QR / shareable slug | ✅ | ✅ |
| Save a contact by scanning a QR | ✅ | ✅ |
| AI paper-card scan (OCR → review → save) | ✅ | ✅ |
| Contacts list: search, tags, quick actions | ✅ | ✅ |
| Edit / delete a contact | ✅ | ✅ |
| Light / dark mode | — | ✅ (follows system) |

## Verification performed

- Every backend Python file was syntax-checked and the FastAPI app was
  imported with the pinned `requirements.txt` versions; all 20 routes
  registered correctly.
- The entire frontend was type-checked with `tsc --noEmit` (zero errors)
  and a full production Metro bundle (`expo export`) was built successfully
  (2,369 modules), confirming every import resolves and the Babel/Reanimated
  toolchain is wired correctly.

## Deliberate MVP scope decisions

- **Auth:** email/password only. Google/OTP sign-in (mentioned on the real
  app's store listing) needs external provider credentials not available
  for a self-hosted MVP; the API layer is structured so either can be added
  without touching UI code.
- **Schema migrations:** tables are created via `Base.metadata.create_all`
  on startup for MVP speed. Swap in Alembic before scaling past one
  developer — see `backend/README.md`.
- **Media storage:** uploaded avatars/scans are saved to local disk under
  `backend/media/`. Swap `app/core/storage.py`'s internals for S3/GCS when
  deploying — no endpoint code needs to change.
- **OCR:** uses local Tesseract with heuristic field-splitting, a real
  working pipeline, not a stub. A commercial OCR API would improve accuracy
  on messy/handwritten cards if needed later.
