# Copilot instructions for template-vision

## Overview

This repository is a full-stack image gallery app with two runtime parts:

- Frontend: React + Vite app under `src/` for login, protected navigation, and image gallery actions.
- Backend: FastAPI service under `server/` for authentication and Google Cloud Storage (GCS) operations.

The app is designed around a simple upload/list/edit/delete workflow for images. The backend is the source of truth for auth and storage, while the frontend is a thin client that persists the auth token in browser storage and calls the API endpoints.

## Build, test, and lint

### Frontend

Run these from the repo root:

- Install deps: `npm install`
- Start dev server: `npm run dev`
- Production build: `npm run build`
- Lint: `npm run lint`
- Preview production bundle: `npm run preview`

There is no automated frontend or backend test suite currently configured in this repository. There are no Vitest/Jest/pytest files or test scripts to run. If the repo gains tests later, keep the command consistent with the existing tooling rather than inventing a new runner.

### Backend

Run these from the `server/` directory:

- Create virtualenv and install deps:
  - `python -m venv venv`
  - `source venv/bin/activate` (or `venv\Scripts\activate` on Windows)
  - `pip install -r requirements.txt`
- Run locally: `python main.py`

The server reads configuration from `server/.env` (copied from `server/.env.example`) and expects `credentials.json` to exist locally for Google Cloud access. The app also accepts `PORT` from the environment; this is used by `uvicorn` when running in production.

## High-level architecture

### Frontend structure

- `src/App.jsx` is the app entry for routing. It wraps the app in `AuthProvider` and defines the route tree.
- `src/context/AuthContext.jsx` + `src/services/authService.js` maintain the current auth session (`token` + `username`) in `sessionStorage`.
- `src/components/common/ProtectedRoute.jsx` guards routes that require authentication.
- `src/pages/GalleryPage.jsx` is the main feature page for loading, uploading, editing, deleting, and previewing images.
- `src/services/imageService.js` centralizes all image API calls and uses `Authorization: Bearer <token>` headers.
- `src/services/api.js` provides the shared base URL logic: `VITE_API_URL` from the environment, falling back to `http://localhost:3000`.

### Backend structure

- `server/main.py` is the single FastAPI application entry point.
- It exposes:
  - `POST /api/auth/login` for login
  - `GET /api/images` for listing images
  - `POST /api/images` for upload
  - `PUT /api/images/{file_name}` for update
  - `DELETE /api/images/{file_name}` for delete
- Authentication is implemented with a lightweight HMAC-signed token generated from `AUTH_SECRET` and validated by `require_auth`.
- Image operations use `google.cloud.storage.Client.from_service_account_json(...)` to access the configured GCS bucket.

### Deployment conventions

- The repository is set up for a split deployment model: backend on Render, frontend on Netlify.
- Frontend env vars must use the `VITE_` prefix so they are embedded at build time.
- The backend expects a cloud environment and will fail without `AUTH_SECRET`, bucket settings, and the GCS credentials JSON.
- `server/credentials.json` is intentionally gitignored and must be provided via the deployment platform secret mechanism, not committed to the repo.

## Key conventions specific to this repo

- Keep frontend API calls in `src/services/*.js` instead of calling `fetch` directly from components.
- Use `sessionStorage` for the auth session (token and username) and keep `AuthContext` as the single access point for session state.
- `src/pages/GalleryPage.jsx` follows a predictable pattern: fetch images, show loading/error flow, then handle upload/edit/delete through local component state.
- The backend expects file uploads in `FormData` with the field name `image`, and it derives a blob name from the current timestamp plus the original filename.
- `require_auth` and `imageService.js` are intentionally coupled: do not change the Bearer token format without updating both sides.
- Route protection is implemented at the router layer, not as ad hoc conditions in each component.
- Production CORS should be restricted to the concrete frontend origin instead of using a wildcard; the app currently defaults to `allow_origins=["*"]` in `server/main.py` and should be tightened before public deployment.
- Keep secrets in `.env` or deployment environment variables, not in source files. `server/.env.example` documents the expected keys.

## Important configuration values

- Frontend API base: `import.meta.env.VITE_API_URL` with fallback `http://localhost:3000`
- Backend env vars required by `server/main.py`: `PORT`, `GOOGLE_CLOUD_PROJECT_ID`, `GOOGLE_CLOUD_BUCKET_NAME`, `APP_USERNAME`, `APP_PASSWORD`, `AUTH_SECRET`
- Local backend secret file: `server/credentials.json`
- Repo-level ignored secrets: `.env`, `server/.env`, `server/credentials.json`

## Repo-specific notes

- The project is a starting template for computer vision work, but the current implementation focuses on storage, auth, and gallery management rather than ML analysis.
- The codebase is intentionally compact and not layered into a large monorepo; most feature logic is colocated in a small set of route, context, and service files.
- When changing behavior in the gallery flow, verify both the frontend state transitions and the corresponding server endpoints in `server/main.py` so the request lifecycle stays in sync.
