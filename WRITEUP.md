# WRITEUP — Used-Car Listing App

## What was built

A full-stack used-car marketplace with three surfaces:

1. **Public site** (`app/(public)`)
   - Browse page: server-rendered grid of **published** cars only, with text
     search (make/model) and filters (make, year range, price range, max mileage).
     Filters live in **URL search params** so links are shareable and SSR-friendly.
   - Detail page: full specs + the **AI-generated ad copy** if present, falling
     back to the raw description with a "not yet enhanced" note. Draft/Sold cars
     return a 404 publicly.
2. **Admin panel** (`app/admin`)
   - Cookie-based login (`ADMIN_PASSWORD` + `httpOnly` cookie), route protection,
     a dashboard table of **all** cars, and a shared `CarForm` for create/edit.
   - Enforced lifecycle `Draft → Published → Sold` (no skipping), delete allowed
     only on `Draft`, with confirmation dialogs and toast feedback.
3. **AI feature** (`app/api/ai/generate-copy` + `components/admin/AICopyGenerator`)
   - An admin writes rough notes; one click sends the listing fields to Claude,
     which returns polished 3–4 sentence buyer-facing copy. The result is shown
   in a highlighted preview and copied into a separate `adCopy` field on save,
     kept distinct from the raw `description`.

### Key decisions

- **Single-repo Next.js App Router** (not FastAPI + a separate frontend) — for a
  scoped local demo, one `npm run dev` is simpler, and the AI-consultancy value
  is shown through the Claude integration quality rather than infra complexity.
- **Filters via URL params, not client state.** Makes links shareable, works with
  SSR, and keeps the server component the source of truth. `SearchBar` and
  `FilterPanel` are thin clients that just push to the URL.
- **Shared query/validation logic** (`lib/queries.ts`, `lib/validation.ts`) so the
  browse page and the `GET /api/cars` route filter identically, and create/update
  validate identically.
- **`adCopy` stored separately from `description`.** The public detail page shows
  `adCopy` when available and otherwise falls back to `description`, so an admin
  can iterate on AI copy without losing the original notes.
- **Graceful AI degradation.** If `ANTHROPIC_API_KEY` is unset (e.g. a fresh
  checkout), the generate-copy route returns a clear 503 instead of crashing, so
  the rest of the app is fully usable without a key.
- **Demo-grade auth on purpose** — a single shared password + `httpOnly` cookie
  matches the brief. A real app would use hashed credentials / OAuth / sessions
  in a store.

## How AI tools were used

- **Claude Code (this agent)** authored the entire codebase, ran the
  scaffold/migrate/seed loop, and debugged real errors (the Prisma 7 driver-adapter
  requirement, the `PrismaLibSql` constructor signature, libSQL URL handling, and
  the env-loading quirk in the seed subprocess).
- **Claude API (`claude-haiku-4-5`)** powers the ad-copy feature. The prompt is
  the one from the brief: expert automotive copywriter, enthusiastic-but-honest,
  3–4 sentences, **no invented details**. A single non-streaming `messages.create`
  call is plenty for short output, with `max_tokens: 1024` as a safety ceiling.

## Notes on the stack (Next.js 16 + Prisma 7)

The brief targeted Next.js 15 / Prisma 5; the current `@latest` versions ship
**Next.js 16** and **Prisma 7**, both with breaking changes the code adapts to:

- Next 16 **renamed `middleware.ts` to `proxy.ts`** — route guarding lives in
  `proxy.ts`.
- Next 16 made `params`, `searchParams`, and `cookies()` **async (Promises)** —
  they are `await`ed in every page/route.
- Prisma 7's new `prisma-client` generator has **no built-in query engine** and
  requires a **driver adapter**; `lib/prisma.ts` wires the libSQL adapter to the
  local SQLite file.
- The generated client is **ESM**, so the seed runs via **`tsx`** (configured in
  `prisma.config.ts`) rather than `ts-node`.

## What I'd add with more time

- **Real image uploads** (S3/object storage) instead of the car-emoji placeholder,
  with a proper `Image` model and multi-image support.
- **Proper auth** — per-admin accounts with hashed passwords, session expiry, and
  CSRF protection on mutations.
- **Pagination / "load more"** on the browse page once the catalog grows.
- **Streaming the AI copy** token-by-token for a snappier UX, plus a "tone"
  selector (enthusiastic / concise / luxury) and per-listing regenerate history.
- **Tests** — API route tests (auth, lifecycle transitions, validation) and a
  Playwright smoke test of the browse → detail → admin-publish flow.
- **Rate limiting + input sanitization** on the AI endpoint, and persisting the
  prompt/model used so copy can be re-graded later.

---

## Addon — Kanban board + AI Listing Analyzer

The admin dashboard is now a **drag-and-drop Kanban board** (Draft → Published →
Sold columns via `@dnd-kit/core`), and the car form embeds an **AI Listing
Analyzer** that returns a marketability health score and a suggested price range
in a single Claude call.

### Why Kanban over a table

Status transitions are a **spatial, visual** concept. A table with a "Move to
Published" button per row buries the workflow behind a click; a board makes the
lifecycle visible at a glance, mirrors how real ops teams work (Jira/Trello),
and needs zero training to understand. Dragging a card is also a single gesture,
and invalid drags (e.g. Published → Draft, or anything out of Sold) are blocked
client-side with a toast and snap-back, while the existing `PATCH
/api/cars/[id]/status` route remains the server-side source of truth.

Implementation: `KanbanBoard` (DndContext, optimistic state, transition guard),
`KanbanColumn` (`useDroppable`, hover highlight, empty state), `KanbanCard`
(`useDraggable` with `CSS.Translate` transform, action buttons that
`stopPropagation` on pointer-down so they don't start a drag). A `DragOverlay`
shows a lifted ghost while dragging.

### Why Health Score + Price Range together

They share **one LLM call** because price accuracy is literally one of the four
scoring dimensions (pricing / description / completeness / appeal, 25 pts each →
100). Asking the model to *evaluate* the price *and* suggest a range in one pass
is more coherent — the price-range rationale **is** the pricing-score
explanation — cheaper (one API call) and lower-latency for the user. The prompt
forces strict JSON; the route strips any stray markdown fences, parses, and
**retries once with a stricter prompt** before failing, then persists
`healthScore` / `suggestedPriceMin` / `suggestedPriceMax` /
`analysisSuggestions` / `lastAnalyzedAt` to the car (so the score survives a
refresh and shows on the Kanban card via `HealthScoreBadge`).

### Trade-offs acknowledged

Price suggestions are based on **Claude's training data, not live market data** —
the analyzer UI carries a disclaimer to that effect. With more time I'd integrate
a real car-price source (e.g. an OLX / Mobil123 / CarGurus feed) and have Claude
reason over actual comparables rather than its prior. Other follow-ups:
persisting the full breakdown (currently only score + range + suggestions are
stored, so the breakdown bars re-render only after a fresh analysis), and
analyzing listings that are still drafts-but-unsaved (today the car must exist to
persist the result).

---

## Branding & visual design

The Logique logo (`public/logique-logo.png`) is rendered in the header via
`next/image`. Beyond the logo, the whole UI was re-skinned with a deliberate
**editorial automotive** aesthetic — chosen specifically to avoid the generic
"AI dashboard" look (Inter font, purple-on-white gradients, cookie-cutter
cards):

- **Type pairing**: **Fraunces** (a characterful, optically-sized display serif)
  for headings/prices, paired with **Manrope** for UI/body. Loaded with
  `next/font/google`, which **self-hosts the font files at build time** — so
  there's no runtime CDN dependency and it works inside the Docker image.
- **Palette**: a warm **paper** background with **ink** type and a single sharp
  **ember-orange** accent (`#c8471f`). Dominant neutral + one sharp accent beats
  a timid, evenly-distributed palette. Tokens live in `app/globals.css` under
  Tailwind v4's `@theme`.
- **Atmosphere**: a subtle SVG paper-grain overlay, staggered fade-up reveals on
  the browse grid (CSS `animation-delay`), and **editorial monogram
  placeholders** (the make's initial in Fraunces) instead of stock car photos —
  which also sidesteps the "no real image storage" limitation gracefully.
- Status colors were re-tuned to warm stone/emerald/sky so they sit on the
  cream palette instead of clashing with it.

The design is intentionally cohesive across the public site and the admin board
so the product feels like one brand rather than a public theme + a separate
"admin skin".

## Deployment (Docker + HTTPS)

A self-contained production stack so the app runs on a server over **https**
with one command:

- **`Dockerfile`** — `node:22-slim` image. Installs deps (`npm ci`, which runs
  the `prisma generate` postinstall), builds Next.js, and ships a small
  `docker-entrypoint.sh` that runs `prisma migrate deploy` (+ seeds sample data
  on first run) before `next start`. DevDependencies are kept so the entrypoint
  can run Prisma/`tsx`.
- **`docker-compose.yml`** — two services: `app` (the image, SQLite DB on a
  persisted `db-data` volume) and `caddy`.
- **`Caddyfile`** — Caddy terminates TLS. By default it uses `tls internal`
  (self-signed), so `https://<server-ip>` works with zero config; for a real
  domain, swap the site address and drop `tls internal` and Caddy auto-issues
  Let's Encrypt certificates. Plain HTTP on :80 redirects to HTTPS.

Secrets (`ANTHROPIC_API_KEY`, `ADMIN_PASSWORD`) are read from a gitignored
`.env` via compose's `${VAR}` substitution — never baked into the image. The
SQLite database and Caddy state live on named volumes, so data survives
redeploys.

> Note: the image build was not executed on the development machine (the local
> Docker daemon was unavailable); the `Dockerfile` follows standard Next.js +
> Prisma patterns and `docker compose config` validates, but the first real
> build happens on the server.
