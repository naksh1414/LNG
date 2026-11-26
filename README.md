# Learn N Grow publisher site

Next.js 16 site with a MongoDB book catalogue, WhatsApp enquiries and an admin panel.

## Setup

```bash
pnpm install
cp .env.example .env.local   # fill in values
pnpm dev
```

## Environment variables

See `.env.example`: `MONGODB_URI`, `MONGODB_DB`, `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `BLOB_READ_WRITE_TOKEN`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_CONTACT_EMAIL`.

## Scripts

- `pnpm test` run Vitest
- `pnpm typecheck` run `tsc --noEmit`
- `pnpm build` production build
- `pnpm seed` load the starting catalogue into MongoDB (export `MONGODB_URI` and `MONGODB_DB` first; tsx does not read `.env.local`)
- `pnpm seed-admin` create the admin user from `ADMIN_EMAIL` / `ADMIN_PASSWORD`

## Performance

Lighthouse 13.6.0 (default mobile profile, simulated throttling) against `pnpm start` with the seeded local catalogue, 2026-11-14:

| Page | LCP | CLS |
| --- | --- | --- |
| `/` | 0.8 s | 0 |
| `/catalog` | 0.7 s | 0 |

Targets: LCP under 2.5 s, CLS under 0.1. Re-run with `CHROME_PATH=/usr/bin/chromium pnpm dlx lighthouse http://localhost:3000/ --chrome-flags="--headless --no-sandbox"`.

Seeded books have no cover images (covers are generated text blocks), so these numbers do not yet include uploaded cover photos.

## Deploy with Docker

```
cp .env.example .env     # set MONGO_PASSWORD, SESSION_SECRET (openssl rand -base64 32), ADMIN_EMAIL, ADMIN_PASSWORD, NEXT_PUBLIC_*
docker compose up -d --build
docker compose --profile tools run --rm tools pnpm seed-admin   # first admin only
```

- App on `PORT` (default 3000); `GET /api/health` checks the database. Put a TLS reverse proxy (Caddy, nginx, a platform load balancer) in front; it must pass the `Host` header.
- Uploads go to Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set, else to the `uploads` volume.
- `NEXT_PUBLIC_*` values are baked in at build: rebuild after changing them.
- Mongo is not published to the host. Back up the `mongo-data` and `uploads` volumes.
- Image only (no compose): `docker build -t lng .`, then run with `MONGODB_URI`, `MONGODB_DB`, `SESSION_SECRET`.
