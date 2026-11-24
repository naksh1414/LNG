# LNG Publisher Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the Learn and Grow draft into a light, professional Montessori publisher site with a database-backed catalogue and book pages, a WhatsApp enquiry flow, and an admin panel for books, enquiries and site metrics.

**Architecture:** Next.js App Router, server components by default, small client islands for motion and forms. MongoDB (repository modules, no raw model calls in routes). Admin protected by a signed-cookie session checked in `proxy.ts` and again in every admin route. Metrics come from our own `events` collection.

**Tech Stack:** Next.js 16, React 19, Tailwind 4, shadcn (restyled), `motion` (`motion/react`), MongoDB driver, `zod`, `bcryptjs`, `jose`, `@vercel/blob`, Vitest + Testing Library + `mongodb-memory-server`.

**Spec:** `docs/superpowers/specs/2026-11-13-lng-publisher-site-design.md`

## Global Constraints

- Repo: `~/Desktop/Personal/LNG`, branch `feat/publisher-site` (create from `main`). Commit with explicit paths only. Never push.
- Light theme only, locked. Palette tokens: background `#f4f4f2`, foreground slate `#232c36`, muted `#5f6872`, line `#dcdcd8`, accent terracotta `#c4572f` (the only accent). Corner radius 0 everywhere. Text on the accent button is white and passes AA; if not, darken the accent, keep the family.
- Sans-serif only. Not Inter, no serif. No em-dash (`—`) or en-dash (`–`) character anywhere in source copy; use a hyphen or rewrite. No scroll cues, status dots, version labels, section-number eyebrows or labels laid over images. At most one eyebrow label per three sections.
- Hero: headline at most 2 lines, subtext at most 20 words, one primary and at most one secondary action, `min-h-[100dvh]` never `h-screen`.
- Animate only `transform` and `opacity`. Every animation honors `prefers-reduced-motion`. Motion code lives in `'use client'` leaf components using `motion/react`; no `window.addEventListener('scroll')`.
- Next.js 16 conventions apply (verify in the installed Next docs before use): `proxy.ts` replaces `middleware.ts`; `params` and `searchParams` are Promises.
- Environment variables (all server-side unless `NEXT_PUBLIC_`): `MONGODB_URI`, `MONGODB_DB`, `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `BLOB_READ_WRITE_TOKEN`, `NEXT_PUBLIC_WHATSAPP_NUMBER`. Missing values must fail with a clear message, never a silent default for secrets.
- Session cookie name `lng_admin`, HTTP-only, `SameSite=Lax`, `Secure` in production, 7-day expiry. Login lockout: 5 failed attempts per 15 minutes per IP plus email. Enquiry limit: 5 per hour per IP. Event limit: 120 per minute per IP.
- Cover upload: JPEG, PNG or WebP only, max 5 MB, no SVG. Cover display ratio 3:4, `object-cover`.
- Events collection has a 13-month TTL index. Unique visitors are counted with a daily-rotating salted hash of IP and user agent. No identifying cookies.
- Tests: Vitest, spec files beside source (`*.test.ts` / `*.test.tsx`). Repository tests use `mongodb-memory-server`. Route handlers are tested by calling the exported `GET`/`POST` with a `Request`.
- Model tier per task is the `model-router` suggestion.

## Review Focus

1. Unauthenticated access to any `/admin/*` page or `/api/admin/*` route must redirect or return 401, including after the session cookie is tampered with or expired. Owned by Task 7 and Task 8.
2. Upload abuse: wrong type, SVG, oversize, zero-byte and double-extension filenames are rejected before anything is stored. Owned by Task 8.
3. A deleted or unpublished book must not break the enquiry list, the metrics page or a cached book URL (the page returns 404; enquiries and events keep a title snapshot). Owned by Tasks 4, 6, 8, 9.
4. Empty states: zero books, zero events, zero enquiries and a search with no match all render a composed empty view, not a blank or an error. Owned by Tasks 4, 9, 10.
5. WhatsApp number missing or malformed: the enquiry is still saved, no broken `wa.me` link is produced, and the visitor sees a clear message instead of a dead button. Owned by Task 5.

---

### Task 1: Tooling and project hygiene

**Model:** sonnet

**Files:**
- Modify: `package.json`, `next.config.mjs`, `.gitignore`
- Create: `vitest.config.ts`, `vitest.setup.ts`, `.env.example`, `README.md`
- Delete: `public/placeholder*.{jpg,png,svg}`, `public/icon-dark-32x32.png`, `public/icon-light-32x32.png` (template leftovers; keep `icon.svg` and `apple-icon.png` until Task 2 replaces them)
- Test: `tests/tooling.test.ts`

**Interfaces:**
- Produces: scripts `test` (`vitest run`), `typecheck` (`tsc --noEmit`), `seed` (`tsx scripts/seed.ts`), `seed-admin` (`tsx scripts/seed-admin.ts`); path alias `@/*` available in Vitest.

- [ ] **Step 1: Create the branch and install**

Run: `git switch -c feat/publisher-site && pnpm add mongodb zod bcryptjs jose @vercel/blob motion && pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event mongodb-memory-server tsx @types/bcryptjs`
Expected: lockfile updated; `package.json` name changed to `lng-publisher-site`.

- [ ] **Step 2: Write the failing test** `tests/tooling.test.ts`: `alias @ resolves` (imports `@/lib/utils` and calls `cn('a','b')` expecting `'a b'`), and `next config does not ignore build errors` (imports `next.config.mjs` default export, asserts `typescript?.ignoreBuildErrors` is not `true`).

- [ ] **Step 3: Run to verify failure**

Run: `pnpm test`
Expected: FAIL (no Vitest config yet; ignoreBuildErrors is true).

- [ ] **Step 4: Implement**: `vitest.config.ts` with jsdom environment, the React plugin, `@` alias, setup file importing `@testing-library/jest-dom/vitest`; remove `typescript.ignoreBuildErrors` and `images.unoptimized` from `next.config.mjs` (keep the security headers, add `images.remotePatterns` for `*.public.blob.vercel-storage.com`); `.env.example` listing every variable in Global Constraints; `.gitignore` gains `.env*.local`; README covers setup, env vars, seed commands.

- [ ] **Step 5: Run to verify pass, then fix any type errors the stricter build reveals**

Run: `pnpm test && pnpm typecheck && pnpm build`
Expected: all pass. Fix each type error at its source; do not re-disable checks.

- [ ] **Step 6: Commit** the changed files by explicit path: `git commit -m "chore: tooling, strict build, env example"`.

---

### Task 2: Design system, fonts, layout shell

**Model:** sonnet

**Files:**
- Modify: `app/globals.css` (replace), `app/layout.tsx`, `components/ui/button.tsx`
- Create: `components/ui/input.tsx`, `components/ui/textarea.tsx`, `components/ui/label.tsx`, `components/site-header.tsx` (replace), `components/site-footer.tsx`, `components/wordmark.tsx`, `components/reveal.tsx`, `app/icon.svg` (replace), `lib/site.ts`
- Test: `components/site-header.test.tsx`, `components/reveal.test.tsx`

**Interfaces:**
- Produces: CSS variables `--background --foreground --muted-foreground --border --accent` and Tailwind tokens for them; `Button` with `variant: 'primary' | 'quiet'`, `size: 'default' | 'sm'`; `<Reveal delay?: number>{children}</Reveal>` (client leaf; fades and rises 16px once in view, renders children immediately under reduced motion); `<SiteHeader />`, `<SiteFooter />`; `lib/site.ts` exporting `site = { name: 'Learn and Grow', whatsappNumber: string | undefined, nav: {label: string; href: string}[] }` where `nav` is Books `/catalog`, About `/about`, For schools `/#schools`, Contact `/#contact`.

- [ ] **Step 1: Write failing tests**: `site-header renders one nav landmark with Books, About, For schools and Contact links`; `menu toggle sets aria-expanded and shows links on small screens`; `reveal renders children visible when prefers-reduced-motion is reduce` (mock `matchMedia`).

- [ ] **Step 2: Run to verify failure**: `pnpm vitest run components` expects FAIL.

- [ ] **Step 3: Implement** the tokens and base styles with Tailwind 4 `@theme`, radius 0, focus ring in the accent, `:root { color-scheme: light }`. Fonts through `next/font`: pick one sans family (not Inter) with a distinct display weight, plus at most one companion; remove the Inter Mono files and `app/fonts`. Replace the dense hand-written CSS classes with Tailwind utilities. Header: text wordmark "LEARN AND GROW" with the LG mark, one line at desktop, height 64-72px, no "EST." sub-label. Footer: wordmark, nav, WhatsApp link when configured, copyright. Replace the favicon. Keep `viewport.themeColor` equal to the background token.

- [ ] **Step 4: Run to verify pass and build**: `pnpm test && pnpm build`.

- [ ] **Step 5: Commit**: `git commit -m "feat: terracotta and slate design system and shell"`.

---

### Task 3: Book domain, formatting, seed data

**Model:** sonnet

**Files:**
- Create: `lib/books/types.ts`, `lib/books/format.ts`, `lib/books/seed-data.ts`
- Test: `lib/books/format.test.ts`

**Interfaces:**
- Produces, `types.ts`:
  - `type Book = { id: string; title: string; subtitle: string; author: string; slug: string; subject: string; ageMin: number; ageMax: number; description: string; coverUrl: string | null; coverAlt: string; isbn?: string; pages?: number; language?: string; featured: boolean; published: boolean; createdAt: string; updatedAt: string }`
  - `type BookInput = Omit<Book, 'id' | 'createdAt' | 'updatedAt' | 'slug'> & { slug?: string }`
  - `bookInputSchema` (zod): title, author, subject non-empty (max 120), `ageMin` and `ageMax` integers 0-18 with `ageMin <= ageMax`, `description` max 2000, `coverUrl` null or https URL, `pages` positive integer optional.
- Produces, `format.ts`: `ageLabel(min: number, max: number): string` (`'Ages 3 to 6'`; same min and max gives `'Age 4'`); `slugify(title: string): string`; `uniqueSlug(base: string, exists: (slug: string) => Promise<boolean>): Promise<string>` (appends `-2`, `-3`).
- Produces, `seed-data.ts`: `seedBooks: BookInput[]` built from the 8 books in the current `lib/books.ts` (keep title, subtitle, author, subject, existing text; parse ages from `'Ages 3–6'`; `description` is the subtitle; all published, first four featured, `coverUrl: null`, `coverAlt` is `'Cover of <title>'`).

- [ ] **Step 1: Write failing tests**: `ageLabel formats a range`, `ageLabel formats a single age`, `slugify lowercases, strips apostrophes and punctuation, collapses spaces` (`"A Room of One's Own"` gives `'a-room-of-ones-own'`), `slugify transliterates nothing and never returns empty (falls back to 'book')`, `uniqueSlug appends -2 then -3`, `bookInputSchema rejects ageMin greater than ageMax`, `bookInputSchema rejects a non-https coverUrl`, `seedBooks has 8 entries that all pass bookInputSchema`.

- [ ] **Step 2: Run to verify failure**: `pnpm vitest run lib/books` expects FAIL.

- [ ] **Step 3: Implement** the files above. Delete `lib/books.ts` at the end of Task 4 when its last import is gone, not here.

- [ ] **Step 4: Run to verify pass**: same command expects PASS.

- [ ] **Step 5: Commit**: `git commit -m "feat: book domain types, formatting and seed data"`.

---

### Task 4: Mongo layer, repositories, public catalogue and book pages

**Model:** sonnet

**Files:**
- Create: `lib/db/mongo.ts`, `lib/books/repo.ts`, `scripts/seed.ts`, `app/catalog/catalog-client.tsx`, `app/books/[slug]/page.tsx`, `app/books/[slug]/not-found.tsx`, `components/book-cover.tsx`, `components/book-card.tsx`
- Modify: `app/catalog/page.tsx`
- Delete: `lib/books.ts`, `components/book-catalog.tsx` (after migrating imports)
- Test: `lib/books/repo.test.ts`, `app/catalog/catalog-client.test.tsx`, `components/book-cover.test.tsx`

**Interfaces:**
- Consumes: Task 3 types and helpers.
- Produces, `lib/db/mongo.ts`: `getDb(): Promise<Db>` (cached client, reads `MONGODB_URI` and `MONGODB_DB`, throws `Error('MONGODB_URI is not set')` when missing); `ensureIndexes(): Promise<void>`.
- Produces, `lib/books/repo.ts`: `listPublishedBooks(): Promise<Book[]>`, `listAllBooks(): Promise<Book[]>`, `getPublishedBookBySlug(slug: string): Promise<Book | null>`, `getBookById(id: string): Promise<Book | null>`, `createBook(input: BookInput): Promise<Book>`, `updateBook(id: string, input: BookInput): Promise<Book | null>`, `deleteBook(id: string): Promise<boolean>`, `listSubjects(): Promise<string[]>` (distinct subjects of published books, sorted).
- Produces components: `<BookCover book>` (renders `next/image` lazy, 3:4, when `coverUrl` is set; otherwise a generated text cover from title and author with no overlay label); `<BookCard book index>` linking to `/books/[slug]`; `<CatalogClient books subjects />` (subject chips from the `subjects` prop plus "All books", search box, results count with `aria-live`, animated filtering with `layout` transitions, composed empty state with a clear-filters action).

- [ ] **Step 1: Write failing repo tests** (memory server): `createBook assigns a unique slug and timestamps`, `two books with the same title get -2 slug`, `listPublishedBooks hides unpublished books`, `getPublishedBookBySlug returns null for unpublished`, `updateBook returns null for an unknown id`, `deleteBook removes the book`, `listSubjects derives from published books only`.

- [ ] **Step 2: Write failing component tests**: `CatalogClient filters by subject chip`, `CatalogClient filters by search text across title, author and subject`, `CatalogClient shows the empty state with zero books and with no match, and clearing restores the list` (Review Focus 4), `BookCover renders a text cover when coverUrl is null and an image with alt text otherwise`.

- [ ] **Step 3: Run to verify failure**: `pnpm vitest run lib/books/repo.test.ts app/catalog components/book-cover.test.tsx` expects FAIL.

- [ ] **Step 4: Implement.** `books` indexes: unique `slug`, plus `published` and `subject`. Convert `_id` to `id` string and `Date` to ISO string at the repository boundary. Catalogue page is a server component fetching `listPublishedBooks()` and `listSubjects()` and passing them to `CatalogClient`; use `export const revalidate = 60`. Book page: `generateMetadata` and the page await `params`; unpublished or unknown slug calls `notFound()` (Review Focus 3). Book page shows large cover, title, subtitle, author, `ageLabel`, subject, description, optional isbn, pages and language, and an enquire action that Task 5 wires. `scripts/seed.ts` inserts `seedBooks` only when the collection is empty.

- [ ] **Step 5: Run to verify pass and build**: `pnpm test && pnpm typecheck`.

- [ ] **Step 6: Commit**: `git commit -m "feat: database-backed catalogue and book pages"`.

---

### Task 5: Enquiries and WhatsApp

**Model:** sonnet

**Files:**
- Create: `lib/rate-limit.ts`, `lib/enquiries/whatsapp.ts`, `lib/enquiries/repo.ts`, `lib/enquiries/schema.ts`, `app/api/enquiries/route.ts`, `components/enquiry-form.tsx`, `components/enquire-button.tsx`
- Modify: `app/books/[slug]/page.tsx` (wire the enquire action), delete `components/contact-form.tsx` after its imports move
- Test: `lib/rate-limit.test.ts`, `lib/enquiries/whatsapp.test.ts`, `lib/enquiries/repo.test.ts`, `app/api/enquiries/route.test.ts`, `components/enquiry-form.test.tsx`

**Interfaces:**
- Produces, `lib/rate-limit.ts`: `hit(key: string, limit: number, windowMs: number): Promise<{ allowed: boolean; remaining: number }>` (Mongo collection `rate_limits` with a TTL index on `expiresAt`).
- Produces, `whatsapp.ts`: `normalizeNumber(raw: string | undefined): string | null` (digits only, 8-15 digits, otherwise `null`); `buildWhatsAppUrl(number: string | undefined, e: { name: string; contact: string; message: string; bookTitle?: string }): string | null` giving `https://wa.me/<digits>?text=<encoded>` or `null` when the number is invalid. Message text: `Hello Learn and Grow, I am <name> (<contact>).` then an optional `I am asking about "<bookTitle>".` then the message.
- Produces, `schema.ts`: `enquirySchema` (zod): `name` 1-100, `contact` 3-120, `message` 1-2000, `bookId` optional, `website` honeypot (must be empty).
- Produces, `repo.ts`: `createEnquiry(input: { name: string; contact: string; message: string; bookId?: string; bookTitle?: string }): Promise<Enquiry>`, `listEnquiries(): Promise<Enquiry[]>` (newest first), `setEnquiryRead(id: string, read: boolean): Promise<boolean>`, `deleteEnquiry(id: string): Promise<boolean>`, `countUnread(): Promise<number>`. `Enquiry = { id; name; contact; message; bookId?: string; bookTitle?: string; read: boolean; createdAt: string }`. `bookTitle` is a snapshot taken at creation (Review Focus 3).
- Produces route: `POST /api/enquiries` returns `201 { id }` on success, `400 { error }` on validation failure, `429` when over the limit; a filled honeypot returns `201` without saving.
- Produces components: `<EnquiryForm book?: { id: string; title: string } />` (labels above fields, inline errors, saves via the route, then opens `buildWhatsAppUrl(...)` in a new tab; if the number is invalid shows "Your enquiry was saved. We will contact you." and no link; if the request fails still opens WhatsApp when the URL exists); `<EnquireButton book />` on the book page that scrolls to or opens the same form prefilled.

- [ ] **Step 1: Write failing tests**: `hit allows up to the limit then blocks and reports remaining`, `hit resets after the window` (fake timers); `normalizeNumber strips spaces, plus and dashes` (`'+91 98765-43210'` gives `'919876543210'`), `normalizeNumber returns null for too short, letters and undefined` (Review Focus 5); `buildWhatsAppUrl encodes the message with line breaks and quotes`, `buildWhatsAppUrl returns null for an invalid number`; repo: `createEnquiry stores a book title snapshot`, `listEnquiries returns newest first`, `setEnquiryRead toggles`, `countUnread counts only unread`; route: `valid body returns 201 and saves`, `invalid body returns 400`, `filled honeypot returns 201 and saves nothing`, `sixth request in an hour from one IP returns 429`; form: `submits, saves, then opens the WhatsApp URL`, `still opens WhatsApp when the save request fails`, `with an invalid number shows the saved message and renders no wa.me link` (Review Focus 5), `shows inline errors and does not submit when a required field is empty`.

- [ ] **Step 2: Run to verify failure**: `pnpm vitest run lib/rate-limit.test.ts lib/enquiries app/api/enquiries components/enquiry-form.test.tsx` expects FAIL.

- [ ] **Step 3: Implement.** Client IP from `x-forwarded-for` first entry, else `'unknown'`. The form's honeypot is a visually hidden `website` input with `tabIndex={-1}` and `autoComplete="off"`. Replace the old `mailto:` form.

- [ ] **Step 4: Run to verify pass**: same command expects PASS; then `pnpm typecheck`.

- [ ] **Step 5: Commit**: `git commit -m "feat: enquiry flow with WhatsApp click to chat"`.

---

### Task 6: Events and visitor counting

**Model:** sonnet

**Files:**
- Create: `lib/events/visitor.ts`, `lib/events/schema.ts`, `lib/events/repo.ts`, `app/api/events/route.ts`, `components/analytics-tracker.tsx`
- Modify: `app/layout.tsx` (mount the tracker), `components/enquiry-form.tsx` (send `enquiry_sent` after a successful save), `app/catalog/catalog-client.tsx` (call `trackSearch` from the search box)
- Test: `lib/events/visitor.test.ts`, `lib/events/repo.test.ts`, `app/api/events/route.test.ts`, `components/analytics-tracker.test.tsx`

**Interfaces:**
- Produces, `visitor.ts`: `visitorHash(ip: string, userAgent: string, day: string, secret: string): string` (sha256 hex of the four values; `day` is `YYYY-MM-DD` in UTC); `isBot(userAgent: string): boolean`; `deviceType(userAgent: string): 'mobile' | 'tablet' | 'desktop'`.
- Produces, `schema.ts`: `eventSchema` (zod discriminated union on `type`): `page_view { path }`, `book_view { path, bookId }`, `search { term (1-80) }`, `enquiry_sent { bookId? }`; paths must start with `/` and not `/admin`.
- Produces, `repo.ts`: `recordEvent(e: { type: EventType; path?: string; bookId?: string; bookTitle?: string; term?: string; visitorHash: string; device: Device }): Promise<void>`; creates the TTL index of 13 months on `createdAt`.
- Produces route: `POST /api/events` returns `204`; bots, invalid bodies and rate-limited calls return `204` or `400`/`429` without storing; never throws to the client.
- Produces `<AnalyticsTracker />` (client leaf): sends `page_view` on each route change (and `book_view` for `/books/<slug>` using `navigator.sendBeacon` with a fetch fallback), debounced `search` from the catalogue search box via a small exported `trackSearch(term: string)` function; does nothing on `/admin` paths or when `navigator.doNotTrack === '1'`.

- [ ] **Step 1: Write failing tests**: `visitorHash is stable within a day and differs across days and user agents`, `isBot flags Googlebot and curl but not a Chrome UA`, `deviceType detects mobile, tablet and desktop`; repo: `recordEvent stores the event and the TTL index exists`; route: `valid page_view returns 204 and stores one event`, `bot user agent stores nothing`, `admin path stores nothing`, `invalid body returns 400`, `over 120 per minute returns 429`; tracker: `sends page_view on mount and on route change`, `does nothing on /admin paths`, `does nothing when doNotTrack is 1`.

- [ ] **Step 2: Run to verify failure**: `pnpm vitest run lib/events app/api/events components/analytics-tracker.test.tsx` expects FAIL.

- [ ] **Step 3: Implement.** `book_view` stores a `bookTitle` snapshot taken from the book repository at write time (Review Focus 3). Daily salt is `SESSION_SECRET` plus the UTC date.

- [ ] **Step 4: Run to verify pass**: same command expects PASS; `pnpm typecheck`.

- [ ] **Step 5: Commit**: `git commit -m "feat: first-party event tracking"`.

---

### Task 7: Admin authentication

**Model:** opus (security: sessions, lockout, route protection)

**Files:**
- Create: `lib/auth/password.ts`, `lib/auth/session.ts`, `lib/auth/admins-repo.ts`, `lib/auth/require-admin.ts`, `proxy.ts`, `app/admin/login/page.tsx`, `app/api/admin/login/route.ts`, `app/api/admin/logout/route.ts`, `app/api/admin/password/route.ts`, `app/admin/layout.tsx`, `scripts/seed-admin.ts`
- Test: `lib/auth/password.test.ts`, `lib/auth/session.test.ts`, `lib/auth/admins-repo.test.ts`, `proxy.test.ts`, `app/api/admin/login/route.test.ts`, `app/api/admin/password/route.test.ts`

**Interfaces:**
- Produces, `password.ts`: `hashPassword(plain: string): Promise<string>` (bcrypt, cost 12); `verifyPassword(plain: string, hash: string): Promise<boolean>`; `passwordPolicy(plain: string): string | null` (min 10 characters, returns an error message or `null`).
- Produces, `session.ts`: `createSessionToken(adminId: string): Promise<string>` and `readSessionToken(token: string | undefined): Promise<{ adminId: string } | null>` (HS256 `jose` JWT signed with `SESSION_SECRET`, 7-day expiry; returns `null` for missing, tampered or expired); constant `SESSION_COOKIE = 'lng_admin'`.
- Produces, `admins-repo.ts`: `findAdminByEmail(email: string)`, `createAdmin(email: string, passwordHash: string)`, `setPasswordHash(id: string, hash: string)`, `countAdmins(): Promise<number>`.
- Produces, `require-admin.ts`: `requireAdmin(request: Request): Promise<{ adminId: string } | Response>` returning a `401` JSON response when not signed in; every `/api/admin/*` route calls it first (Review Focus 1).
- Produces `proxy.ts`: runs for `/admin/:path*` and `/api/admin/:path*`; allows `/admin/login` and `POST /api/admin/login`; redirects pages to `/admin/login` and returns `401` for API routes when the token is missing or invalid.
- Produces routes: `POST /api/admin/login` (body email and password; rate limit 5 per 15 minutes per IP plus email through `hit`, `429` when blocked; same generic `401` for unknown email and wrong password; sets the cookie on success); `POST /api/admin/logout` clears the cookie; `POST /api/admin/password` (needs the current password, applies `passwordPolicy`).
- Produces script: `pnpm seed-admin` creates the admin from `ADMIN_EMAIL` and `ADMIN_PASSWORD` when none exists; `pnpm seed-admin -- --reset` replaces the password of the existing admin.

- [ ] **Step 1: Write failing tests**: `hashPassword then verifyPassword succeeds and a wrong password fails`, `passwordPolicy rejects 9 characters`; `session round trip returns the admin id`, `readSessionToken returns null for a tampered token, an expired token and undefined` (Review Focus 1); repo: `findAdminByEmail is case-insensitive`, `createAdmin enforces unique email`; proxy: `redirects /admin/books to /admin/login without a cookie`, `returns 401 for /api/admin/books without a cookie`, `returns 401 for a tampered cookie`, `allows /admin/login`, `allows the page with a valid cookie`; login route: `correct credentials set an HttpOnly cookie`, `wrong password and unknown email return the same 401 body`, `sixth failed attempt returns 429`, `successful login does not reset the lockout counter for other emails`; password route: `rejects a wrong current password`, `rejects a weak new password`, `accepts a valid change`.

- [ ] **Step 2: Run to verify failure**: `pnpm vitest run lib/auth proxy.test.ts app/api/admin` expects FAIL.

- [ ] **Step 3: Implement.** Compare passwords in constant time (bcrypt does this); do a dummy hash compare when the email is unknown so response time does not reveal which emails exist. Login page is a simple restyled form with inline errors. `app/admin/layout.tsx` renders the admin chrome (sidebar with Books, Enquiries with unread count, Metrics, Change password, Log out) using shadcn-style components in the same tokens.

- [ ] **Step 4: Run to verify pass**: same command expects PASS; `pnpm typecheck`.

- [ ] **Step 5: Commit**: `git commit -m "feat: admin authentication and route protection"`.

---

### Task 8: Admin books management and cover upload

**Model:** opus (file upload handling and authorization on every write)

**Files:**
- Create: `app/api/admin/books/route.ts`, `app/api/admin/books/[id]/route.ts`, `app/api/admin/upload/route.ts`, `lib/uploads/validate.ts`, `app/admin/books/page.tsx`, `app/admin/books/new/page.tsx`, `app/admin/books/[id]/page.tsx`, `components/admin/book-form.tsx`, `components/admin/book-table.tsx`, `components/admin/confirm-dialog.tsx`
- Modify: `app/admin/page.tsx` (redirect to `/admin/books`)
- Test: `lib/uploads/validate.test.ts`, `app/api/admin/books/route.test.ts`, `app/api/admin/upload/route.test.ts`, `components/admin/book-form.test.tsx`

**Interfaces:**
- Consumes: `requireAdmin` (Task 7), `bookInputSchema` and repo (Tasks 3-4).
- Produces, `validate.ts`: `validateCover(file: { type: string; size: number; name: string; bytes: Uint8Array }): { ok: true; ext: 'jpg' | 'png' | 'webp' } | { ok: false; error: string }` (checks the declared type, size 1 byte to 5 MB, and the magic bytes of JPEG, PNG or WebP; rejects SVG and any mismatch between declared type and content).
- Produces routes, all calling `requireAdmin` first: `GET /api/admin/books` (all books); `POST /api/admin/books` (create, `201`); `PATCH /api/admin/books/[id]`; `DELETE /api/admin/books/[id]`; `POST /api/admin/upload` (multipart field `file`, stores to Vercel Blob under `covers/<uuid>.<ext>` ignoring the client filename, returns `{ url }`). After any write call `revalidatePath` for `/`, `/catalog` and `/books/[slug]`.
- Produces admin UI: books table (cover thumbnail, title, subject, ages, published and featured toggles, edit, delete with confirmation), form for every `BookInput` field with live cover preview, inline validation errors from the API, loading and error states.

- [ ] **Step 1: Write failing tests**: `validateCover accepts real JPEG, PNG and WebP bytes`, `validateCover rejects an SVG with an image/png label`, `validateCover rejects 5 MB plus one byte, zero bytes, and a PNG labelled image/jpeg`, `validateCover ignores a double-extension name like cover.php.png and returns only the detected ext` (Review Focus 2); routes: `every /api/admin/books method returns 401 without a session` (Review Focus 1), `POST creates a book and returns 201`, `PATCH of an unknown id returns 404`, `DELETE removes the book`, `invalid body returns 400 with field errors`; upload: `returns 401 without a session`, `rejects a disallowed type with 400 and never calls Blob`, `stores an allowed image and returns its url` (Blob mocked); form: `shows field errors from the API`, `shows a cover preview after upload`, `delete asks for confirmation before calling the API`.

- [ ] **Step 2: Run to verify failure**: `pnpm vitest run lib/uploads app/api/admin/books app/api/admin/upload components/admin` expects FAIL.

- [ ] **Step 3: Implement.** Deleting a book leaves enquiries and events untouched because they keep a title snapshot (Review Focus 3). "Hide" is the `published` toggle.

- [ ] **Step 4: Run to verify pass**: same command expects PASS; `pnpm typecheck`.

- [ ] **Step 5: Commit**: `git commit -m "feat: admin book management with cover upload"`.

---

### Task 9: Admin enquiries and metrics

**Model:** sonnet

**Files:**
- Create: `app/api/admin/enquiries/route.ts`, `app/api/admin/enquiries/[id]/route.ts`, `app/api/admin/metrics/route.ts`, `app/admin/enquiries/page.tsx`, `app/admin/metrics/page.tsx`, `components/admin/enquiry-list.tsx`, `components/admin/metrics-view.tsx`, `components/admin/metrics-charts.tsx`
- Modify: `lib/events/repo.ts` (add `metrics`)
- Test: `lib/events/metrics.test.ts`, `app/api/admin/enquiries/route.test.ts`, `components/admin/enquiry-list.test.tsx`, `components/admin/metrics-view.test.tsx`

**Interfaces:**
- Produces, in `lib/events/repo.ts`: `metrics(rangeDays: 7 | 30 | 90, now?: Date): Promise<Metrics>` with `Metrics = { views: number; visitors: number; enquiries: number; conversion: number; topPages: { path: string; count: number }[]; topBooks: { bookId: string; title: string; count: number }[]; searches: { term: string; count: number }[]; devices: { device: 'mobile' | 'tablet' | 'desktop'; count: number }[]; daily: { date: string; views: number; visitors: number }[] }`. `visitors` is the count of distinct `visitorHash`; `conversion` is `enquiries / visitors` as a number from 0 to 1 (0 when no visitors); `daily` includes a zero row for every day in range; lists are capped at 10 and sorted descending.
- Produces routes (all call `requireAdmin` first): `GET /api/admin/enquiries`; `PATCH /api/admin/enquiries/[id]` body `{ read: boolean }`; `DELETE /api/admin/enquiries/[id]`; `GET /api/admin/metrics?range=7|30|90` (default 30, anything else `400`).
- Produces UI: enquiry list (unread first emphasis, book title snapshot, mark read or unread, delete with confirmation, `wa.me` reply link built with `buildWhatsAppUrl` when the contact looks like a phone number); metrics page with range tabs, stat tiles labelled "Page views", "Visitors", "Enquiries started" and "Enquiry rate", a daily line chart, top pages, top books, searches and device split. Charts load through `next/dynamic` with a skeleton and `ssr: false`; the chart library choice is the builder's (small, no icons from a second family).

- [ ] **Step 1: Write failing tests**: `metrics counts distinct visitors, not events`, `metrics fills zero days across the range`, `metrics excludes events older than the range`, `metrics conversion is 0 with no visitors` (Review Focus 4), `metrics topBooks keeps the title snapshot of a deleted book` (Review Focus 3), `metrics caps lists at 10`; routes: `enquiries and metrics return 401 without a session` (Review Focus 1), `metrics rejects range=5`; UI: `enquiry list shows the empty state with zero enquiries` and `mark read calls the API`, `metrics view shows zero tiles and an empty message with no events` (Review Focus 4), `range tab change refetches`.

- [ ] **Step 2: Run to verify failure**: `pnpm vitest run lib/events/metrics.test.ts app/api/admin/enquiries components/admin/enquiry-list.test.tsx components/admin/metrics-view.test.tsx` expects FAIL.

- [ ] **Step 3: Implement** `metrics` with one aggregation per list; compute `daily` in UTC.

- [ ] **Step 4: Run to verify pass**: same command expects PASS; `pnpm typecheck`.

- [ ] **Step 5: Commit**: `git commit -m "feat: admin enquiries and site metrics"`.

---

### Task 10: Home page part one: hero, subjects, featured books

**Model:** sonnet

**Files:**
- Modify: `app/page.tsx` (replace), `app/catalog/page.tsx` and `app/catalog/catalog-client.tsx` (read `searchParams.subject`, a Promise, as the initial chip)
- Create: `components/home/hero.tsx`, `components/home/cover-fan.tsx`, `components/home/subjects-row.tsx`, `components/home/featured-books.tsx`
- The hero uses covers; the remote Unsplash hero image is removed.
- Test: `components/home/hero.test.tsx`, `components/home/featured-books.test.tsx`

**Interfaces:**
- Consumes: `listPublishedBooks`, `listSubjects`, `BookCover`, `BookCard`, `Reveal`, `Button`.
- Produces: `<Hero books: Book[] />` split layout, left-aligned: one headline of two lines or fewer ("Montessori books for homes and classrooms."), one subtext of 20 words or fewer, primary action "Browse books" to `/catalog`, secondary "For schools" to `/#schools`, no eyebrow, no tagline under the buttons. Right: `<CoverFan books />` shows up to three featured covers overlapped and tilted, entering with a spring and reacting to hover; static under reduced motion; first cover `priority`. `<SubjectsRow subjects />` links each subject to `/catalog?subject=<subject>` (the catalogue reads `searchParams.subject` as the initial chip). `<FeaturedBooks books />` is an asymmetric grid with one large book and several small (layout family used once on the page); with zero featured books it renders nothing and the home page still renders.

- [ ] **Step 1: Write failing tests**: `hero has one h1, one primary and one secondary action, and a subtext of 20 words or fewer`, `hero renders with zero books (no cover fan, no crash)` (Review Focus 4), `subjects row links to the filtered catalogue`, `featured books renders nothing for an empty list`, `catalogue honors ?subject= as the initial filter` (in `app/catalog/catalog-client.test.tsx`).

- [ ] **Step 2: Run to verify failure**: `pnpm vitest run components/home app/catalog` expects FAIL.

- [ ] **Step 3: Implement.** Server component page; only the cover fan and `Reveal` are client leaves. Use `min-h-[100dvh]` for the hero with top padding of at most `pt-24`. Navigation stays on one line.

- [ ] **Step 4: Run to verify pass and build**: `pnpm test && pnpm build`.

- [ ] **Step 5: Commit**: `git commit -m "feat: home hero, subjects and featured books"`.

---

### Task 11: Home page part two: schools, about the press, enquiry, footer

**Model:** sonnet

**Files:**
- Modify: `app/page.tsx`
- Create: `components/home/schools-section.tsx`, `components/home/press-section.tsx`, `components/home/enquiry-section.tsx`
- Test: `components/home/sections.test.tsx`

**Interfaces:**
- Consumes: `EnquiryForm`, `Reveal`, `SiteFooter`, the `#schools` and `#contact` anchors from `lib/site.ts`.
- Produces: `<SchoolsSection />` (id `schools`) a full-width band on a tinted background with three short numbered-free points about classroom orders and a "Ask about classroom orders" action that scrolls to `#contact` (no second contact-intent label elsewhere on the page); `<PressSection />` about the press using the existing About copy, vertical stack, no split header; `<EnquirySection />` (id `contact`) with the form and, when the number is valid, the WhatsApp number as a plain link. Each of the home sections uses a different layout family; no more than two image-and-text splits in a row; at most one eyebrow label on the whole page below the hero; no invented statistics.

- [ ] **Step 1: Write failing tests**: `home sections render with ids schools and contact`, `page contains exactly one contact-intent action label` (scans rendered button and link text for "Get in touch", "Contact us", "Let's talk" and expects at most one distinct label), `enquiry section shows the WhatsApp link only when the number is valid` (Review Focus 5).

- [ ] **Step 2: Run to verify failure**: `pnpm vitest run components/home/sections.test.tsx` expects FAIL.

- [ ] **Step 3: Implement.** Reuse and tighten the existing copy; remove em-dashes and number labels ("01 / OUR POINT OF VIEW", "01 - 03"); no marquee unless one genuinely serves a section.

- [ ] **Step 4: Run to verify pass**: `pnpm test && pnpm build`.

- [ ] **Step 5: Commit**: `git commit -m "feat: home schools, press and enquiry sections"`.

---

### Task 12: About and Contact pages

**Model:** sonnet

**Files:**
- Modify: `app/about/page.tsx`
- Create: `app/contact/page.tsx`
- Test: `app/about/page.test.tsx`, `app/contact/page.test.tsx`

**Interfaces:**
- Consumes: shell components, `EnquiryForm`, `site` config.
- Produces: restyled About page keeping its existing content and route; `/contact` page with the enquiry form and the contact details from `NEXT_PUBLIC_CONTACT_EMAIL` when set, with WhatsApp link when valid, and no placeholder phone or address text shown to visitors (omit what is not configured).

- [ ] **Step 1: Write failing tests**: `about page keeps its heading and renders inside the shell`, `contact page renders the form and omits unconfigured details`, `contact page has exactly one h1`.

- [ ] **Step 2: Run to verify failure**: `pnpm vitest run app/about app/contact` expects FAIL.

- [ ] **Step 3: Implement.** Replace hand-written CSS classes with the new tokens and utilities.

- [ ] **Step 4: Run to verify pass**: same command expects PASS.

- [ ] **Step 5: Commit**: `git commit -m "feat: restyled about and contact pages"`.

---

### Task 13: Copy lint, accessibility and performance pass

**Model:** sonnet

**Files:**
- Create: `tests/copy-lint.test.ts`, `tests/a11y.test.tsx`
- Modify: any file the checks flag
- Modify: `README.md`

**Interfaces:**
- Produces: `tests/copy-lint.test.ts` scanning `app/`, `components/` and `lib/site.ts` source text.

- [ ] **Step 1: Write failing checks**: `no em-dash or en-dash character in app, components or lib source`, `no use of window.addEventListener('scroll'`, `no import from lucide-react alongside another icon family` (one icon family only; the builder keeps `lucide-react` since the draft depends on it, or migrates all icons to one allowed family), `every motion component references useReducedMotion or MotionConfig reducedMotion`, `home page html has no h-screen class`, `all images below the fold are lazy (no priority except the first cover)`; a11y: render home, catalogue and book page and assert one h1, labelled inputs, visible focus class on interactive elements, and `alt` on every image.

- [ ] **Step 2: Run to verify failure**: `pnpm vitest run tests` expects FAIL on whatever remains from earlier tasks.

- [ ] **Step 3: Fix** each flagged item in place; do not weaken the checks.

- [ ] **Step 4: Run the whole verification**: `pnpm test && pnpm typecheck && pnpm build`. Then run Lighthouse against `pnpm start` for `/` and `/catalog` and record LCP and CLS in `README.md`; fix anything over LCP 2.5 s or CLS 0.1.

- [ ] **Step 5: Commit**: `git commit -m "chore: copy lint, accessibility and performance pass"`.

---

### Task 14: End-to-end check with a real database

**Model:** opus (adversarial review of the whole branch)

**Files:** none created; findings and README updates only.

- [ ] **Step 1: Start services**: a local MongoDB (`docker run -d -p 27017:27017 mongo:7`) and `.env.local` from `.env.example` with a test `BLOB_READ_WRITE_TOKEN` (or a Blob stub if none is available). Run `pnpm seed && pnpm seed-admin && pnpm dev`.

- [ ] **Step 2: Walk the flows in a browser**: home, catalogue filter and search, a book page, send an enquiry (verify WhatsApp opens with the right text and the enquiry appears in admin), log in, add a book with a cover, hide it, delete it, view metrics after browsing as a visitor, change password, log out. Check at phone width (375px) and desktop. Record each failure.

- [ ] **Step 3: Abuse checks**: request `/admin/books` and `/api/admin/books` without a cookie; edit the cookie value; upload an SVG renamed to `.png`; submit six enquiries quickly; submit six wrong logins; open a deleted book URL.
Expected: redirect or 401, 400, 400, 429 on the sixth enquiry, 429 on the sixth login, 404.

- [ ] **Step 4: Branch-wide review** by a fresh reviewer on the whole diff, focused on Review Focus 1-5 and the Global Constraints. Fix findings, rerun `pnpm test && pnpm typecheck && pnpm build`.

- [ ] **Step 5: Commit any fixes** with explicit paths. Do not push or deploy.

---

## Not in this plan

Deployment to Vercel and domain setup, automatic WhatsApp delivery through Meta's Business API, checkout or prices, multiple admin users, emailed password reset, dark mode, multi-language, server-side catalogue pagination, and real cover images and copy (the owner supplies them; seeded books use generated text covers until then).
