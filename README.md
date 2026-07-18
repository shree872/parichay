
Readme · MD
# Parichay — Digital Business Card & Networking App
 
A full-stack MVP for creating, sharing, and collecting digital business cards — build your card once, share it with a QR code, and grow your network by scanning either another user's QR code or a physical paper business card (auto-read with on-device OCR).
 
Built as an original implementation in the digital-business-card category (the same category as apps like Azlogics' Parichay, HiHello, and Popl), with a production-shaped architecture on both the client and the server.
 
![Platform](https://img.shields.io/badge/platform-Expo%20Go-000020?logo=expo&logoColor=white)
![Frontend](https://img.shields.io/badge/frontend-React%20Native-61DAFB?logo=react&logoColor=black)
![Backend](https://img.shields.io/badge/backend-FastAPI-009688?logo=fastapi&logoColor=white)
![Database](https://img.shields.io/badge/database-PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Language](https://img.shields.io/badge/language-TypeScript%20%2F%20Python-3178C6)
 
---
 
## Table of contents
 
- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [API overview](#api-overview)
- [Verification performed](#verification-performed)
- [Deliberate MVP scope decisions](#deliberate-mvp-scope-decisions)
- [Roadmap](#roadmap)
---
 
## Features
 
**Account & identity**
- Email/password registration and login
- JWT access tokens with silent refresh (no repeated logins)
- Secure on-device token storage (OS-level encrypted keychain)
**Digital business card**
- Create and edit a card: name, title, company, bio, phone, email, website, address
- Upload a profile photo
- Five selectable color themes
- Auto-generated unique shareable link + QR code
**Networking**
- Scan another user's QR code → preview their card → save to your contacts
- **AI business card scanner** — photograph a physical paper card, on-device OCR extracts the fields, review and edit before saving
- Search, tag, and organize saved contacts
- One-tap call, email, and website actions from any contact
**Experience**
- Light / dark mode, follows system setting
- Runs directly in Expo Go — no native build required for development
## Tech stack
 
| Layer | Technology |
|---|---|
| Mobile app | React Native, Expo, Expo Router, TypeScript |
| State / data | React Query, React Hook Form, Zod |
| UI | React Native Paper, Reanimated, Gesture Handler |
| Backend | FastAPI, Python 3.11+ |
| Database | PostgreSQL, SQLAlchemy 2.0 (ORM) |
| Auth | JWT (access + refresh tokens), bcrypt password hashing |
| OCR | Tesseract (via `pytesseract`) |
 
## Architecture
 
```
┌─────────────────────────┐
│   Mobile app (Expo Go)  │   screens, forms, camera
└────────────┬─────────────┘
             │  REST API (JSON over HTTP)
┌────────────▼─────────────┐
│   Backend API (FastAPI)  │   auth · cards · contacts · OCR
└────────────┬─────────────┘
             │  SQL via SQLAlchemy ORM
┌────────────▼─────────────┐
│   Database (PostgreSQL)  │   stores all app data
└───────────────────────────┘
```
 
**Backend** follows a strict layered design — `api` (routes) → `crud` (business logic) → `models` (database tables) — with `schemas` (Pydantic) as the I/O contract between them. Adding a new resource means adding one file per layer, never touching the others.
 
**Frontend** mirrors this — `api/` (HTTP calls) → `hooks/` (React Query wrappers) → `app/` (screens). Screens never call the API directly; they only ever call a hook, which keeps loading/error/caching logic out of the UI code.
 
## Project structure
 
```
parichay/
├── backend/
│   ├── app/
│   │   ├── main.py                 FastAPI app entrypoint
│   │   ├── core/                   config, security (JWT/hashing), media storage
│   │   ├── db/                     SQLAlchemy engine/session
│   │   ├── models/                 User, Profile, Connection tables
│   │   ├── schemas/                Pydantic request/response contracts
│   │   ├── crud/                   business logic per resource
│   │   ├── services/ocr.py         OCR extraction pipeline
│   │   └── api/v1/endpoints/       auth, users, profiles, connections routes
│   ├── requirements.txt
│   └── README.md                   full backend setup guide
│
└── frontend/
    ├── app/                        Expo Router screens (file-based routing)
    │   ├── (auth)/                 login, register
    │   ├── (tabs)/                 card, contacts, scan, settings
    │   ├── profile/                edit card
    │   └── connection/             view/edit/add/preview a contact
    ├── src/
    │   ├── api/                    Axios client + per-resource HTTP calls
    │   ├── hooks/                  React Query hooks
    │   ├── context/AuthContext.tsx session state machine
    │   ├── components/             DigitalCard, QRCodeDisplay, UI primitives
    │   ├── theme/                  Paper theme + card color palettes
    │   └── utils/                  SecureStore wrapper, Zod validation schemas
    ├── package.json
    └── README.md                   full frontend setup guide
```
 
## Getting started
 
Full, detailed setup instructions (including troubleshooting) live in [`backend/README.md`](backend/README.md) and [`frontend/README.md`](frontend/README.md). Quick version:
 
**1. Backend**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env       # then edit with your local Postgres credentials + a SECRET_KEY
createdb parichay
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Confirm it's running at `http://localhost:8000/docs`.
 
**2. Frontend**
```bash
cd frontend
npm install
cp .env.example .env       # set EXPO_PUBLIC_API_URL to http://<your-LAN-IP>:8000/api/v1
npx expo start
```
Scan the QR code with the **Expo Go** app on your phone (same Wi-Fi network as your computer).
 
> Expo Go only supports one specific SDK version at a time — check your installed Expo Go's supported SDK (Settings → App info inside Expo Go) against this project's `expo` version in `frontend/package.json` if you hit a version-mismatch error.
 
## Environment variables
 
**`backend/.env`**
 
| Variable | Purpose |
|---|---|
| `SECRET_KEY` | signs JWT tokens — use a long random string |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_HOST` / `POSTGRES_PORT` / `POSTGRES_DB` | local Postgres connection |
| `PUBLIC_APP_BASE_URL` | base URL embedded in generated QR codes |
 
**`frontend/.env`**
 
| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_API_URL` | your backend's LAN address, e.g. `http://192.168.1.50:8000/api/v1` |
 
## API overview
 
Full interactive docs are auto-generated by FastAPI at `/docs` once the backend is running. Key endpoints:
 
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | create an account |
| `POST` | `/api/v1/auth/login` | get access + refresh tokens |
| `POST` | `/api/v1/auth/refresh` | silently renew an access token |
| `GET` / `POST` / `PUT` | `/api/v1/profiles/me` | fetch / create / update your own card |
| `GET` | `/api/v1/profiles/slug/{slug}` | public — view a card via its QR/share link |
| `GET` | `/api/v1/connections` | list your saved contacts (search + tag filters) |
| `POST` | `/api/v1/connections/from-profile` | save a contact by scanning their QR |
| `POST` | `/api/v1/connections/scan` | upload a photo, get back OCR-extracted fields |
| `POST` | `/api/v1/connections/from-scan` | confirm and save the reviewed scan |
 
## Verification performed
 
- Every backend Python file syntax-checked; the FastAPI app imports cleanly with the pinned `requirements.txt` versions, and all routes register correctly.
- The entire frontend type-checks with `tsc --noEmit` (zero errors) and produces a successful full production Metro bundle, confirming every import resolves and the Babel/Reanimated toolchain is correctly wired.
## Deliberate MVP scope decisions
 
- **Auth is email/password only.** Google/OTP sign-in needs external provider credentials not available for a self-hosted MVP — the API layer is structured so either could be added without touching UI code.
- **Schema uses `Base.metadata.create_all`, not Alembic**, for MVP speed. Swap to migrations before scaling past a single developer.
- **Media storage is local disk** (`backend/media/`). `app/core/storage.py` isolates this so swapping to S3/GCS later requires no endpoint changes.
- **OCR runs locally via Tesseract**, a real working pipeline rather than a stub. Accuracy on messy/handwritten cards is lower than a commercial cloud OCR API would provide — a reasonable place to upgrade later.
## Roadmap
 
- [ ] Alembic migrations
- [ ] Automated test suite (pytest + React Native Testing Library)
- [ ] Cloud media storage (S3/GCS)
- [ ] Google / phone-OTP sign-in
- [ ] Rate limiting on auth endpoints
- [ ] CI pipeline (lint, typecheck, tests on every push)
