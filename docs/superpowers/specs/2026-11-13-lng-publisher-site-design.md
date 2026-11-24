# Learn and Grow (LNG) Publisher Site: Design

Status: draft for approval. Date: 2026-11-13.
Builds on the existing draft in this repo (Next.js 16, Tailwind 4, shadcn, base-ui). Items marked **(my call)** were chosen by the author of this document, not stated by the owner.

## Intent
Learn and Grow is a publisher of Montessori books. The site shows the catalogue to parents, teachers and schools, and lets them enquire about a book. The person commissioning the site needs an admin panel to add and remove books and to watch how the site is used. It is a single-publisher site: one brand, one database, one WhatsApp number. It is not a platform for several publishers.

## Goals
1. A professional, light-themed, responsive public site with more depth than the current draft: more sections, better motion, real cover imagery.
2. A catalogue with filters, search and a page per book.
3. An enquiry flow: a contact form that opens WhatsApp with the message ready, addressed to the owner's number. Every enquiry is also saved so none are lost.
4. An admin panel: login, add / edit / remove books with cover upload, view enquiries, view site metrics.
5. Lazy loading wherever it helps (images below the fold, heavy client components, the admin charts).
6. Interactive and animated in a way that has a reason: filters, hover on covers, reveals on scroll. Respect `prefers-reduced-motion`.

## Non-goals (v1)
Online checkout, cart or payments. Automatic WhatsApp delivery through Meta's Business API (can be added later behind the same enquiry endpoint). Multiple admin roles. Dark mode. Multi-language. Blog or CMS pages beyond books.

## Anti-goals
- Looking like a generated template: no AI-purple, no centred hero over a gradient, no three equal feature cards, no invented statistics, no cute filler copy, no em-dashes anywhere on the page.
- Metrics that need a third-party dashboard to read. The owner wants them inside the admin panel.
- Losing an enquiry because a visitor did not press send in WhatsApp.

## Visual direction (chosen by owner: "C, Terracotta and Slate")
Light theme only, locked for the whole site. Neutral grey-white background (about `#f4f4f2`), slate text (about `#232c36`), one terracotta accent (about `#c4572f`) used identically everywhere. Sharp corners (radius 0) as the single shape rule. Book covers bring the other colours. Final tokens can be tuned for contrast but the family stays.
Constraints from the taste rules the owner asked to apply:
- Sans-serif display and body. Not Inter as the default, no serif. **(my call)** Pick one family and, at most, one companion. The current draft's Inter Mono headings are replaced.
- One accent colour only. Buttons and form fields meet WCAG AA contrast.
- Hero fits the first screen: headline of two lines or fewer, subtext of 20 words or fewer, one primary and at most one secondary action. No scroll cue, no tagline strip under the buttons.
- Section layouts vary: no layout family used twice, no more than two image-and-text splits in a row, at most one marquee on the whole page.
- No decorative status dots, version labels, section-number eyebrows or pills laid over images. Eyebrow labels at most one per three sections.
- Motion has a purpose (hierarchy, feedback, state change). Animate transform and opacity only. Use Motion (`motion/react`) in small client components; keep pages server-rendered.
- Real cover images in the catalogue. Until the owner supplies covers, seeded books use clearly marked placeholder covers.

## Public site: pages and sections (my call, owner approved the idea of "more sections")
- **Home:** hero with a fan of real covers; subjects row (links into filtered catalogue); featured books (chosen in admin); a section for schools and teachers (bulk and classroom enquiries); about the press; enquiry section with the form. Six to seven sections, each with a different layout.
- **Catalogue:** keeps the current subject chips and search, now reading books from the database, with filters that update in place and animate on change, and skeleton loading.
- **Book page `/books/[slug]`:** large cover, title, author, age range, subject, description, an "Enquire about this book" action that opens WhatsApp with the book name filled in.
- **About** (exists; restyle and keep its content). **Contact:** the enquiry form on its own page too.
- **Admin `/admin`** (not indexed): see below.

## Enquiry flow
Form fields: name, email or phone, message, optional book. On submit the site (1) saves the enquiry to the database, (2) opens `https://wa.me/<number>?text=<prefilled message>` so the visitor can send it from WhatsApp. If saving fails, still open WhatsApp. The owner's WhatsApp number is configuration (`NEXT_PUBLIC_WHATSAPP_NUMBER`), not code. Enquiries are listed in the admin panel with a read/unread flag. Spam protection: a hidden honeypot field and a rate limit per IP **(my call)**.

## Admin panel
- Login with email and password, session in an HTTP-only cookie. **(my call)** The `admins` collection is the source of truth, password stored hashed. A seed script creates the first admin from `ADMIN_EMAIL` and `ADMIN_PASSWORD` when no admin exists. The admin panel has a change-password page. There is no emailed reset in v1: a forgotten password is fixed by re-running the seed script with `--reset`. Login is rate limited (5 failed attempts per 15 minutes per IP and email), counted in MongoDB.
- **Books:** list, add, edit, delete (with confirmation), mark featured, hide without deleting. Fields: title, subtitle, author, subject, age range, description, cover image, slug (generated), published flag.
- **Enquiries:** newest first, read/unread, which book, delete.
- **Metrics:** page views and unique visitors over 7 / 30 / 90 days, top pages, top books by views, search terms used in the catalogue, enquiry count and conversion (visitors who sent an enquiry), device split. Charts load lazily. Data comes from our own events, not a third-party script.
- The admin UI uses shadcn components, restyled to the same tokens. Dense data UI is allowed here; it does not need to follow the landing-page layout rules.

## Metrics collection **(my call)**
"Conversion" means a saved enquiry (the admin labels it "enquiries started", since the site cannot know whether the visitor pressed send in WhatsApp). Assumes visitors mainly in India; because no identifying cookies are set, no cookie banner is built. Check this against local law before launch.
A small client component on public pages posts `page_view`, `book_view`, `search` and `enquiry_sent` events to `/api/events`. No cookies that identify a person: a daily-rotating salted hash of IP and user agent counts unique visitors. Bots and the admin's own visits are excluded. Keep the existing Vercel Analytics script only if the owner wants it; the admin metrics do not depend on it.

## Data model (MongoDB) **(my call)**
- `books`: title, subtitle, author, slug (unique), subject, ageMin, ageMax (free numbers, shown as "Ages 3 to 6"), description, coverUrl, coverAlt, optional isbn, pages and language, featured, published, createdAt, updatedAt. No price: enquiry-only. Subject is free text chosen from existing subjects in the admin form; the catalogue chips and home subjects row are derived from published books.
- `enquiries`: name, contact, message, bookId?, read, createdAt.
- `events`: type, path, bookId?, term?, visitorHash, device, createdAt (TTL index to keep 13 months).
- `admins`: email, passwordHash.

## Constraints and decisions
- Stack: Next.js (existing, App Router, Server Components by default), Tailwind 4, shadcn restyled, Motion. Package manager: pnpm as in the repo.
- Hosting: Vercel **(my call)**. Database: MongoDB Atlas **(my call, owner already uses Mongo)**. Cover images: Vercel Blob **(my call)**, with `next/image` for responsive sizes and lazy loading. Turn off `images.unoptimized` once images are on a real host.
- Fix while here: set `typescript.ignoreBuildErrors` to false and resolve resulting errors; rename the package from `my-project`; keep the existing security headers.
- Keep existing routes and the home, about and catalogue content unless restyling requires otherwise. Keep route slugs stable.
- Seed the database from the 8 books now in `lib/books.ts`, keeping their existing text. Books without an uploaded cover show a generated text cover (as the draft does now), with no label laid over it.
- Catalogue data is fetched on the server and filtered on the client. That is fine up to a few hundred books; add server pagination beyond that.
- Rate limiting and login lockout use MongoDB (TTL collection). No Redis.
- Cover upload: JPEG, PNG or WebP, max 5 MB, displayed at a fixed 3:4 ratio with `object-cover`. The admin form shows a preview.
- Header uses a text wordmark "LEARN AND GROW" with the existing LG mark. Template placeholder logos and icons are removed, favicon replaced.
- WhatsApp: number from `NEXT_PUBLIC_WHATSAPP_NUMBER` (placeholder until supplied). Shown on the contact section and book pages, and in the footer. No floating chat button. Phone, email and address on Contact are placeholders until supplied.
- Accessibility: keyboard-operable filters and forms, visible focus, `aria-live` results count (already present), alt text for covers.
- Performance targets: LCP under 2.5 s on the home page, CLS under 0.1.

## Left to the builder
Exact fonts within the constraints above, final colour tokens, section copy (plain, no invented numbers), admin chart library choice, skeleton shapes, the exact motion choreography, and project structure inside the app.

## Open items for the owner
WhatsApp number to use. Real cover images and book descriptions. Admin email. Whether to keep Vercel Analytics. Domain name. Who owns the Vercel, MongoDB Atlas and Blob accounts (config is all environment variables, so ownership can change without code changes).
