# dtro Portfolio

The public portfolio and admin interface are a React, TypeScript, and Vite single-page application. The Express API and Prisma database layer live in the sibling `portfolio-backend` repository.

## Local development

1. Install dependencies with `npm ci`.
2. Copy `.env.example` to `.env.local`. The default `API_PROXY_TARGET=http://127.0.0.1:5000` points to the sibling backend. Change it only if the backend runs elsewhere.
3. Configure and start `portfolio-backend` with its own `npm run dev` in a second terminal.
4. Start the frontend with `npm run dev` and open `http://localhost:5173`. A device on the same LAN can open `http://<your-computer-IP>:5173` when Windows Firewall allows that connection.

Development requests, uploads, resume downloads, and live viewer events use `/api` on the frontend origin. Vite forwards them to `API_PROXY_TARGET`; a LAN device therefore uses the backend on your development computer. The dev server binds to `0.0.0.0:5173` and exits if that port is occupied. `VITE_API_URL` is used only by production builds. Restart Vite after changing environment settings.

If the backend is stopped, `/api` returns a connection error with status 502 and code `API_UNREACHABLE`. API responses such as authentication failures or upload validation errors retain their HTTP status and server message. Requests are not retried automatically, so a failed save or upload is safe to review before trying again.

`VITE_` variables are included in browser code. Keep credentials and private keys in the backend environment only.

For production, set `VITE_API_URL` to your HTTPS backend origin or API base URL, such as `https://portfolio-backend-7337.onrender.com/api`. The build adds a missing `/api` suffix, removes repeated suffixes, and rejects local hosts, credentials, query strings, and fragments. Configure the backend's `CORS_ORIGINS` with the exact deployed frontend origin.

Cloudflare Pages serves the built `dist/_headers`. Each build derives its CSP `connect-src` API origin from the validated `VITE_API_URL`, using `public/_headers` as the template. Deploy the entire `dist` directory so this header matches the bundle. The policy also permits the portfolio's Google sign-in, Google Fonts, and YouTube/Vimeo embeds.

## Checks

- `npm run lint` runs ESLint.
- `npm test` runs the frontend Node tests.
- `npm run build` type-checks and creates the production bundle. Production builds require an HTTPS `VITE_API_URL`.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the frontend and backend boundaries, folder responsibilities, and conventions.
