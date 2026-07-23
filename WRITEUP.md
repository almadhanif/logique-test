# WRITEUP — AutoListing Used-Car Marketplace

## Overview

AutoListing is a full-stack used-car marketplace built for the Indonesian market.
It spans three surfaces — a bilingual public storefront, an admin Kanban board,
and AI features on both sides — all in a single Next.js App Router repo.

**Stack:** Next.js 16 (App Router) · TypeScript · Prisma 7 · SQLite (libSQL
driver adapter) · Tailwind CSS v4 · OpenRouter (AI) · `@dnd-kit` (drag-and-drop)
· `lucide-react` (icons) · Caddy (HTTPS).

---

## Public storefront

- **Infinite-scroll browse** — 8 listings per page, server-filtered via Prisma
  `where` clauses. The `IntersectionObserver` in `CarList` appends further pages
  from `/api/cars?page=N`, keeping all filtering server-side.
- **Multi-word search** — "wuling almaz" splits into words and ANDs them across
  `make` + `model` fields, so a query spanning both fields matches correctly.
- **Filter panel** — make (dynamic from the `Make` catalog), year range (select
  dropdowns), price range (Rupiah-formatted inputs with dot separators), max
  mileage. Filters live in URL params (shareable, SSR-friendly) and use
  `router.replace(url, { scroll: false })` so the page stays in place — only the
  listing grid refreshes.
- **First-visit promo modal** — shows once per browser (`localStorage` gate),
  rotates between promos, and showcases a randomly-picked published car as a full
  card with a CTA to view it. Two-column layout on desktop, stacks on mobile.
- **Detail page** — full specs, AI-generated ad copy (or raw description
  fallback), and the **Buyer AI Insights** panel (below).
- **Bilingual EN/ID** — a cookie-based locale system (`lib/i18n/`) lets server
  components read the language during SSR. The header `LanguageSwitcher` writes
  the cookie and triggers `router.refresh()`.

## Admin panel

- **Kanban board** (`@dnd-kit/core`) — drag cards between Draft / Published /
  Sold columns with optimistic updates and snap-back on failure. Status
  transitions are free (any direction) so admins can correct mistakes. The server
  `PATCH /api/cars/[id]/status` route validates every move.
- **Make catalog CRUD** (`/admin/makes`) — admins manage the manufacturer
  catalog (add / rename / delete). The car form's make field is a dynamic
  `<select>` sourced from this catalog, not free text.
- **Car form** — create/edit with all fields, embedded **AI Listing Analyzer**,
  and an **Apply AI Suggestions** button that auto-fills price, model, color, ad
  copy, and description from the AI's analysis output.
- Cookie-based auth (`httpOnly` cookie + `ADMIN_PASSWORD`), toast feedback,
  prominent breadcrumbs, logout button.

## AI features

Three AI-powered features, all via a single `lib/ai.ts` wrapper over OpenRouter
(`aiChat`), model configurable via `OPENROUTER_MODEL` (defaults to
`openai/gpt-4o-mini`):

### 1. Admin: Listing Analyzer + Apply Suggestions

One API call returns a 0–100 marketability health score, a suggested price range,
a 4-dimension breakdown (pricing / description / completeness / appeal), and
improvement suggestions — plus `suggestedFields` (recommended price, normalized
model, color, polished ad copy, cleaned description). After analysis, the admin
clicks **Apply AI suggestions** to populate the form with one click. Results are
persisted on the car and shown as a `HealthScoreBadge` on the Kanban card.

The prompt forces strict JSON. The route strips stray markdown fences, parses
defensively, and retries once with a stricter prompt before failing.

### 2. Admin: Ad-copy generator

Turns raw admin notes into polished 3–4 sentence buyer-facing copy via a
separate endpoint (`/api/ai/generate-copy`). The output is stored in the `adCopy`
field, separate from the raw `description`.

### 3. Public: Buyer AI Insights (Deal Intelligence + Inspection Checklist)

On the public detail page, buyers click **"Analisis Sekarang"** to get:

- **Deal verdict** — GREAT_DEAL / GOOD_DEAL / FAIR_DEAL / OVERPRICED with a
  color-coded badge, a 2–3 sentence explanation, a price assessment, and a
  negotiation tip — all in **Bahasa Indonesia**.
- **Inspection checklist** — 5 model-specific items (e.g., "Cek kondisi transmisi
  CVT") with explanations, interactive checkboxes with a progress counter, and a
  print button (print CSS hides everything except the checklist).

If the admin has run the analyzer, the buyer AI references the health score and
price range; otherwise it uses general market knowledge. Results are **cached in
the DB** (`buyerInsight` JSON column) after first generation — every subsequent
visitor sees them instantly.

---

## Design system

The UI follows the **AutoListing** design system
(`design-system/autolisting/MASTER.md`):

- **Aesthetic:** "Vibrant & Block-based" — premium dark, high contrast, geometric.
- **Palette:** primary `#1E293B` (dark) + accent `#DC2626` (action red) on a
  light `#F8FAFC` background. Design tokens in `app/globals.css` (`@theme`).
- **Type:** **Syncopate** (wide, tech display) + **Space Mono** (kinetic mono
  body), self-hosted via `next/font` (no runtime CDN, works in Docker).
- **Icons:** `lucide-react` throughout — no emojis (per the design system's
  a11y rules).
- **A11y:** `cursor-pointer` on all clickables (via a base CSS rule), visible
  focus rings, 4.5:1 contrast, `prefers-reduced-motion` respected, mobile-first
  responsive at 375/768/1024/1440.
- **Brand:** the Logique logo (`public/logique-logo.png`) in the header.

---

## Internationalization (EN / ID)

Cookie-based so it works with server-rendered pages — server components can't
read `localStorage`:

- `lib/i18n/dictionaries.ts` — the EN/ID string tables + a pure `t()` translator.
- `lib/i18n/server.ts` — `getLocale()` reads the `locale` cookie during SSR.
- `LanguageSwitcher` (header) writes the cookie via a module-level helper (to
  satisfy the React 19 `react-hooks/immutability` rule) and calls
  `router.refresh()`.

The public UI (header, hero, search, filters, detail page, footer, promo modal)
is fully translated. Default locale is English.

---

## Deployment (Docker + HTTPS)

- **`Dockerfile`** — `node:22-slim` image; entrypoint runs `prisma migrate
  deploy` (+ seeds on first run) then `next start`. SQLite on a persisted
  volume.
- **`docker-compose.yml`** — `app` + `caddy` services. Secrets read from `.env`
  via compose `${VAR}` substitution.
- **`Caddyfile`** — configured for a real domain
  (`logique-test.solvara-tech.com`) with automatic Let's Encrypt certificate
  provisioning. HTTP → HTTPS redirect on :80.

---

## Notes on the stack (Next.js 16 + Prisma 7)

- **`proxy.ts`** instead of `middleware.ts` (Next 16 rename). Async
  `params` / `searchParams` / `cookies()` are `await`ed throughout.
- **Prisma driver adapter** — Prisma 7's `prisma-client` generator has no query
  engine; `lib/prisma.ts` wires the **libSQL** adapter. The seed runs via
  **`tsx`** (the generated client is ESM).
- **AI via OpenRouter** — a single `lib/ai.ts` wrapper backs all three AI
  features. Buyer insights are cached in the DB for instant repeat access.
- **Number formatting** is manual grouping (not `Intl`) to avoid server/browser
  ICU differences causing hydration mismatches.
- **React 19 lint rules** — `react-hooks/set-state-in-effect` and
  `react-hooks/immutability` are satisfied via `useSyncExternalStore` (language
  switcher), justified `eslint-disable` (promo modal's first-visit gate), and
  module-level helpers (cookie setter, random pick).

---

## How AI tools were used

- **Claude Code** authored the entire codebase, ran the scaffold/migrate/seed
  loop, and debugged real errors: the Prisma 7 driver-adapter requirement, the
  `PrismaLibSql` constructor signature, libSQL URL handling, Next 16's
  `loading.tsx` streaming-200 interaction with `notFound()`, and React 19's
  strict hooks lint rules.
- **OpenRouter (via `lib/ai.ts`)** powers all three AI features — the admin
  listing analyzer (health score + price + suggested fields), the ad-copy
  generator, and the buyer-facing deal intelligence + inspection checklist.
