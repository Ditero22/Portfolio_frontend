# Architecture

## System boundaries

The portfolio runs as two independently installed and deployed applications:

- `portfolio-frontend/` is the React 19, TypeScript, and Vite single-page application.
- `portfolio-backend/` is the Express 5 API, Prisma data layer, and PostgreSQL integration.

Each repository owns its own `package.json`, lockfile, environment, tests, and deployment. The frontend talks to the backend through the `/api` base URL configured as `VITE_API_URL`; browser-visible `VITE_` settings must never contain secrets.

## Frontend

`src/App.tsx` owns the route map and lazy page boundaries. `src/main.tsx` initializes the theme and mounts the app; `AuthProvider` owns the cross-route admin session state. Most other state stays with the page or feature that uses it.

`src/features/` is organized by product area. Public and admin code for the same area is colocated where practical; a feature may contain `pages/`, `components/`, `hooks/`, `services/`, `types/`, or `data/` as needed. The landing page composes previews from several public features, while each feature's service owns its API calls. `src/shared/` is for cross-feature infrastructure and reusable UI: API base configuration, layouts, theme, routing helpers, loading states, and primitive components. `src/assets/` contains imported local media; `public/` contains files served as-is. Frontend tests live under `tests/`.

Preferred dependency direction:

1. Route/page components compose feature UI and hooks.
2. Hooks coordinate feature state and call feature services.
3. Feature services call the backend using `src/shared/api.ts`.
4. Shared code stays independent of feature-specific behavior.

Keep state close to its owner. Put code in `shared/` only when more than one feature genuinely reuses it. Use a feature-local service for backend requests rather than fetching directly from presentation components.

## Backend

`src/server.ts` starts the HTTP server and manages process-level Redis rate-limit connections and visitor-log retention. `src/app.ts` configures CORS, JSON parsing, rate limits, health checks, feature routers, and the final error handler. `src/middleware/` contains request-level auth, upload, and rate-limit middleware. `src/database/` owns the Prisma client and optional Redis connection. `src/modules/` groups API behavior by feature; `src/modules/storage/` contains the shared R2 adapter.

The backend uses a deliberately small modular architecture. Authentication, blog, and project behavior use routes, controllers, and services where separating HTTP handling from business and database work is useful; project request validation also has its own module. Smaller CRUD modules keep validation, Prisma access, and response handling together in their feature route module to avoid adding layers that currently have little independent value. When one of those modules grows, move its request handlers to a controller and its reusable business/data operations to a service within the same module without changing its routes or response contract.

The backend repository has its own [architecture notes](https://github.com/Ditero22/Portfolio_backend/blob/main/ARCHITECTURE.md) and setup guide.

`prisma/schema.prisma` is the current data model, and `prisma/migrations/` is the append-only database history. Do not edit an applied migration to change production data; add a new migration. `prisma/sampledata/` and `prisma/seed.ts` support explicit local seeding. Backend integration tests are in `tests/` and build the TypeScript sources before running.

## Adding a feature

For a public-only change, add the page/components and any owned data or service under `src/features/public/<feature>/`, then register the route in `src/App.tsx`. For admin-managed persistent content, add the frontend management UI under `src/features/admin/manage/<feature>/`, put its API calls in that feature's service, then extend the matching backend module and Prisma schema with a safe migration only if persistence requires it. Keep authorization on the server with `requireAuth`; hiding admin links in the UI is not access control.

Keep API paths, request and response shapes, environment names, and current user flows stable during structural cleanup. Add a dependency only when existing platform APIs and installed packages are not a good fit. Prefer explicit feature names over generic `helpers`, `utils`, or `data` folders shared across unrelated features.

## Checks

- Frontend: `npm run lint`, `npm test`, and `npm run build`.
- Backend: `npm test` (includes `tsc` build) and `npm run build`.
- Production backend startup runs `prisma migrate deploy` through the `prestart` script; frontend production builds require an HTTPS `VITE_API_URL`.
