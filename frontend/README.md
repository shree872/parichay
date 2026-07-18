# Parichay (Frontend)

React Native + Expo Router digital business card app. Runs in Expo Go.

## Features

- Auth (register/login, JWT with silent refresh)
- Digital business card: create/edit, avatar, 5 color themes, auto QR code
- Scan another user's QR → preview their card → save as a connection
- AI business card scanner: photograph a paper card → OCR pre-fills a
  contact → review → save
- Contacts: search, tag, quick-call/email/website, edit, delete
- Light/dark mode (follows system setting)

## 1. Prerequisites

- Node.js 20+
- The backend running locally (see `../backend/README.md`)
- Expo Go installed on your phone (App Store / Play Store), **or** an
  iOS/Android simulator

## 2. Setup

```bash
cd frontend
npm install

cp .env.example .env
# set EXPO_PUBLIC_API_URL to http://<your-machine-LAN-IP>:8000/api/v1
# (Expo Go runs on a separate device, so "localhost" won't reach your laptop)
```

## 3. Run

```bash
npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS). Make sure
your phone and computer are on the same Wi-Fi network.

## 4. Project layout

- `app/` — Expo Router file-based routes only (screens + navigation).
  No API calls or business logic here directly — screens call hooks.
- `src/api/` — Axios client + one module per backend resource.
- `src/hooks/` — React Query hooks; screens never call `src/api` directly.
- `src/context/AuthContext.tsx` — session state machine, token bootstrap.
- `src/components/` — `ui/` primitives (Button, TextField, Avatar, Chip,
  EmptyState) and feature components (DigitalCard, QRCodeDisplay,
  ConnectionListItem).
- `src/theme/theme.ts` — Paper light/dark theme + the 5 card color palettes.
- `src/utils/validation.ts` — Zod schemas shared by every React Hook Form.

Adding a new screen: create the route file under `app/`, add any new API
calls to `src/api/*.api.ts`, wrap them in a React Query hook in
`src/hooks/`, and consume the hook from the screen. This keeps screens thin
and testable.

## 5. Known MVP scope decisions

- Auth is email/password only. Google/phone-OTP sign-in needs external
  provider credentials (Google OAuth client, SMS gateway) that aren't part
  of a self-hosted MVP — the `AuthContext`/`authApi` boundary is built so
  either can be added without touching screens.
- AI card scanning uses local Tesseract OCR with field-extraction
  heuristics (see backend `app/services/ocr.py`). It's a real, working
  pipeline; accuracy on messy/handwritten cards will be lower than a
  commercial cloud OCR API, which is a reasonable place to upgrade later.
