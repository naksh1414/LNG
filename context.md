# LNG website — project context

Compiled from the earlier Claude Code session `b028d885` (Nov 23–24, 2026). Publisher site for **Learn N Grow** (Montessori books). Repo: `naksh1414/LNG`, branch `feat/publisher-site`.

## Stack and run
- Next.js 16.4.6 (upgraded from 16.4.3 for a security advisory), Turbopack, pnpm, Tailwind, shadcn, Vitest.
- Dev server: http://localhost:3000. `pnpm test` (181 passing at last run), `pnpm typecheck`.
- MongoDB: docker container `lng-mongo` (mongo:7), bound to `127.0.0.1:27017` only (rebound during the security pass, same volumes). Site returns 500 if Mongo is down.
- Admin login: `/admin/login`, email `admin@example.com`. Password was reset locally via `pnpm seed-admin -- --reset` (needs `MONGODB_URI`, `MONGODB_DB=lng`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`). Password was shown in chat: **change it** at `/admin/password`.
- Uploads: no `BLOB_READ_WRITE_TOKEN`. In `next dev`, uploads save to `public/uploads` (git-ignored). Live site needs the Vercel Blob token.
- Last commit pushed: `283d07d`. Work after that (admin series, audit log, metrics, enquiries, responsive, animations, security, catalogue hero, favourites mix, E-content link, navbar rename) is **uncommitted** as far as the session shows.

## Design decisions
- Palette from the logo and Montessori materials: chalk-white ground, navy ink, red accent `#C8281C` (darkened for AA contrast), pink/yellow/blue accents. Fonts: Bricolage Grotesque (headings), Figtree (body).
- Logo: `public/logo.png`, used by `components/wordmark.tsx` (size `h-[2.475rem]`).
- Navbar: went pill → full-width sticky bar (`components/site-header.tsx`), `[zoom:0.9]`, Magic UI `scroll-progress` bar kept. Nav links come from `lib/site.ts`. Contact → `/contact`. "Books" renamed **Catalogue** (`/catalog`). **E-content** (https://econtent.learnngrow.co.in/tg/) added last in nav and footer, opens in a new tab.
- Hero: tried book shelf, cover fan, materials illustration, navy spotlight; settled on a light lavender gradient with a bento grid of tiles (Nature, Language, Science and culture), following a user reference image. Tiles are flat colour plus icons (no photos available).
- Home section order: Hero, Audience, Current favourites, Subjects, NEP 2020 panel, New on the shelf, Schools, Press (white bg), Enquiry. Section padding tightened (48px mobile, 64px desktop).
- Redesigned: New on the shelf (lavender panel, swipeable cards, arrows), Schools (pink card plus three white cards), Press, Enquiry/contact card, footer (white, logo-colour strip), About page, Catalogue page (sticky filter bar, cards, extra sections), catalogue hero (live count tiles).
- NEP 2020: badge in home hero and catalogue header; shared panel `components/nep-section.tsx` (`nep` list). **Wording is sample text, not verified.**
- Component libraries: Magic UI `scroll-progress` kept. Aceternity floating-navbar, shimmer-button, spotlight, marquee all installed then removed.
- Animations (`app/globals.css`): staggered hero load-in, floating tiles, drifting gradient, count-up stats, hover lifts. All off under reduced motion. Possible dev-only hydration warning about `caret-color` (unconfirmed, thought to be the screenshot tool).
- Contact page: phone, address, "Get directions" read from `contact` in `lib/site.ts`. **Currently sample values** (`+91 98765 43210`, 12 Example Street, Maps link): replace before launch. Blank values hide their row.

## Data model
- Hierarchy: **Series → Subject → Class → Book**. Books have `series`, `subject`, `classLevel`.
- Routes: `/catalog` (series cards, then search and filters), `/catalog/<series>`, `/catalog/<series>/<subject>` (grouped by class: Nursery, LKG, UKG, Class 1–5), book page with breadcrumb.
- Logic in `lib/books/hierarchy.ts`; plain numbers sort as classes; books without series show under "More books".
- Seed data `lib/books/seed-data.ts`: 8 Dreamscape Art and Craft books (A, B, C = Nursery, LKG, UKG; 1–5 = Class 1–5), ages 3+ to 10+, covers in `public/Books/dreamscape-*.jpg` (~2.3 MB each). Author "Learn N Grow" and descriptions are placeholders. Old sample books backed up only in a temp scratchpad.
- Later a Kids Magic series was added by the user (9 books, 2 series at last check).
- Favourites: books with "Featured" on; home shows 4, round-robin across series (`app/page.tsx`, `lib/books/hierarchy.ts`).

## Admin panel
- Sidebar: Series, Enquiries (unread count), Metrics, Audit log, Change password, Log out. Fixed on desktop, slim scrollable strip on phones.
- `/admin` goes to `/admin/series`. Add series (name, description, optional brand logo). Books are added **only inside a series**: `/admin/series/<series>/books/new` with series locked. `/admin/books` and `/admin/books/new` redirect to `/admin/series`. Edit/delete via `/admin/books/<id>`. Book API `/api/admin/books` unchanged.
- Slug field is read-only, auto-made from the title on new books (server adds `-2`, `-3` on clashes; non-English titles become `book`).
- Series brand logo (JPEG/PNG/WebP, 5 MB) shows on the "Start with a series" cards; no logo means stacked covers. Dreamscape has none yet.
- Audit log (`/admin/audit`): logins (ok/failed, IP), logouts, password changes, series and book add/edit/delete, logo changes. Append-only with a hash chain; page shows "Log intact" or the tampered entry. Limit: direct DB write access can still alter rows. Audit write failure does not block the admin action.
- Metrics (`/admin/metrics`): 30 days of visitors, views, book views, searches, enquiries; admin and bots excluded.
- Enquiries (`/admin/enquiries`): newest first, mark read/new, no delete by design.
- Not built: rename/delete series; subjects and classes are free text on the book form.

## Security (done)
- Admin APIs return 401 and pages redirect when signed out; forged and `alg: none` cookies rejected; NoSQL injection on login rejected; login limit 5 per 15 min; cookie `httpOnly`, `sameSite=lax`, secure in prod; cross-origin writes refused; upload type, content and size checked.
- Added: Mongo bound to localhost, `X-Frame-Options: DENY`, `frame-ancestors 'none'`, production-only CSP, admin pages not cached, `X-Powered-By` removed, HSTS `includeSubDomains`.
- `pnpm audit` prod: 29 findings → 0 (moved `shadcn` to devDependencies, pinned `zod` via pnpm overrides). If `shadcn` is missing from `node_modules`, the CSS import breaks; run `pnpm install`.

## Open items for the user
1. Change admin password and email.
2. Live DB: hosted MongoDB (Atlas) with user, password and IP allow-list.
3. Vercel env vars: `SESSION_SECRET` (32+ chars), `BLOB_READ_WRITE_TOKEN`, others.
4. Sessions are stateless, 7 days; sign-out does not revoke. Rotating the secret signs everyone out.
5. Audit log: give the live DB user insert and read only on `audit_log`.
6. Replace sample phone, address and map link in `lib/site.ts`.
7. Verify NEP 2020 and "What we publish" wording; fix author and descriptions per book.
8. Shrink the ~2.3 MB cover images.
9. Commit and push the work done after `283d07d`.
10. Many sections were only checked by tests and HTML, not visually; mobile menu and lower sections of several pages were never viewed in a browser.
