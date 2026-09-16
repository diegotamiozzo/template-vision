# Copilot instructions

## Project overview

This repository contains a Vite + React frontend and a separate Express backend for a Google Cloud Storage image gallery.

- The frontend entry point is `src/main.jsx`; `src/App.jsx` owns the gallery state and the upload, replace, and delete interactions.
- The backend entry point is `server/index.cjs`. It exposes the image CRUD API under `/api/images`, accepts multipart uploads with the field name `image`, and uses `@google-cloud/storage` for persistence.
- The frontend and backend run as separate processes. The frontend calls the backend at `http://localhost:3000`; Vite serves the UI on its normal development port, usually `http://localhost:5173`.
- The backend constructs public Google Cloud Storage URLs from the configured bucket name. Backend configuration is loaded from `server/.env`, and the service-account key is loaded from `server/credentials.json`.

When changing image behavior, trace the full flow through `src/App.jsx`, `server/index.cjs`, and the Google Cloud Storage object naming/URL logic. Keep the request field names and response properties (`name`, `url`, and `updated`) aligned between client and server.

## Commands

Run commands from the repository root:

```bash
npm install
npm run dev       # Start the Vite frontend
npm run build     # Create the production frontend build
npm run preview   # Preview the production build
npm run lint      # Run ESLint
node server/index.cjs  # Start the Express API on PORT, or 3000 by default
```

For local end-to-end development, run `npm run dev` and `node server/index.cjs` in separate terminals. The API requires valid Google Cloud configuration in `server/.env` and the service-account file expected by `server/index.cjs`.

There is currently no test script or test framework configured in `package.json`, so there is no repository-supported single-test command. Validate frontend changes with `npm run lint` and `npm run build`; API changes require exercising the corresponding `/api/images` endpoint against a configured bucket.

## Code conventions

- Keep frontend code in JSX/JavaScript and follow the existing ESLint flat configuration in `eslint.config.js`, including the React Hooks and React Refresh rules.
- Keep backend code in CommonJS `.cjs`; the root package is configured as `"type": "module"`, so do not convert `server/index.cjs` to a plain `.js` file without also addressing module loading.
- Use the existing REST shape: `POST /api/images` creates, `GET /api/images` lists, `PUT /api/images/:fileName` replaces, and `DELETE /api/images/:fileName` removes an object.
- Uploads use Multer memory storage and are sent as `multipart/form-data`; do not manually set the multipart `Content-Type` header when using `FormData` in the browser.
- The server enables CORS and JSON parsing globally. Preserve this because the Vite frontend is served from a different origin during development.
- Styling is split between component-specific rules in `src/App.css`, global page rules in `src/index.css`, and small inline layout styles in `src/App.jsx`; follow that split when extending the UI.
- Keep cloud credentials and environment values local. Do not add service-account contents or `server/.env` values to source-controlled documentation or client code.
