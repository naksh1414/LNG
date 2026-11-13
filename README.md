# Learn and Grow publisher site

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
