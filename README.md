# 🚗 AutoListing — Used-Car Marketplace

A full-stack used-car marketplace with a polished public storefront and an admin
**Kanban board**. Listings move freely through a `Draft → Published → Sold`
pipeline, every car gets an **AI marketability score + suggested price range**,
and the whole public UI is **bilingual (English / Indonesian)**.

**Stack:** Next.js 16 (App Router) · TypeScript · Prisma 7 · SQLite · Tailwind CSS v4 ·
OpenRouter (AI) · `@dnd-kit` (drag-and-drop).

---

## Highlights

**Public storefront**
- **Infinite-scroll** browse grid (8 listings per page), server-filtered.
- **Search + faceted filters** — make, year range, price range, max mileage — all
  in the URL (shareable) and **scroll-stable** (filters refresh the list in place,
  they don't snap you back to the top).
- **Dynamic manufacturer catalog** — the make filter and the data come from a
  managed `Make` table, not a hardcoded list.
- **Bilingual EN/ID** — toggle in the header; the choice is stored in a cookie so
  server-rendered pages honor it.
- **First-visit promo modal** — shows once per browser, rotates between promos,
  showcases a featured listing.
- **AI-enhanced listing pages** — polished ad copy, marketability breakdown, and
  **buyer-facing AI insights**: a deal verdict (great/good/fair/overpriced),
  price assessment, negotiation tip, and a 5-item inspection checklist — all in
  Bahasa Indonesia, cached after first generation.

**Admin panel**
- **Kanban board** with drag-and-drop status moves (free transitions between any
  of Draft / Published / Sold); invalid API moves are rejected server-side.
- **Make catalog CRUD** (`/admin/makes`) — add / rename / delete manufacturers;
  the car form's make field is a dynamic dropdown sourced from this catalog.
- **AI Listing Analyzer** — one call returns a 0–100 health score, a suggested
  price range, a 4-dimension breakdown, and improvement tips; persisted on the
  car and shown as a badge on the Kanban card. After analysis, click **Apply AI
  suggestions** to auto-fill the form (price, model, color, ad copy, description)
  with the AI's recommended values.
- **AI Ad-copy generator** — turns raw admin notes into polished buyer-facing copy.
- Cookie-based auth, toast feedback, breadcrumbs.

---

## Run it

### A) Docker (recommended for a server — includes HTTPS)

```bash
cp .env.example .env            # set OPENROUTER_API_KEY + ADMIN_PASSWORD
docker compose up -d --build
```

Open **https://localhost** (or `https://<server-ip>`). The first run auto-applies
migrations, seeds sample data, and Caddy terminates TLS. See
[Deployment (Docker + HTTPS)](#deployment-docker--https).

### B) Local development

```bash
npm install                     # also runs `prisma generate`
cp .env.example .env.local      # set OPENROUTER_API_KEY + ADMIN_PASSWORD
npx prisma migrate dev          # create the SQLite DB + apply the schema
npm run db:seed                 # sample makes + listings (Draft/Published/Sold)
npm run dev
```

| Area   | URL                          | Notes                                       |
| ------ | ---------------------------- | ------------------------------------------- |
| Public | http://localhost:3000        | Browse, search, filter published cars.      |
| Admin  | http://localhost:3000/admin  | Redirects to login; password from `.env`.   |
| Makes  | http://localhost:3000/admin/makes | Manage the manufacturer catalog.       |

**Admin flow:** create a listing (Draft) → fill notes → **✨ Analyze listing** for
a score + price range → **Apply AI suggestions** to auto-fill the form → save →
drag the card across the board. Status moves are free (Draft / Published / Sold
in any direction); only Drafts can be deleted.

**Buyer experience:** visitors browse with infinite scroll + filters, see AI ad
copy on the detail page, and can click **Analisis Sekarang** to get a deal verdict
+ printable inspection checklist (in Bahasa Indonesia).

---

## Configuration

All via environment variables (see [`.env.example`](./.env.example)):

| Variable              | Required | Description                                                        |
| --------------------- | -------- | ------------------------------------------------------------------ |
| `DATABASE_URL`        | yes      | SQLite path, e.g. `file:./dev.db` (Docker uses a persisted volume).|
| `OPENROUTER_API_KEY`  | for AI   | OpenRouter key — powers the analyzer, ad-copy, and buyer-insights features. |
| `OPENROUTER_MODEL`    | no       | Override the model (defaults to `openai/gpt-4o-mini`).             |
| `ADMIN_PASSWORD`      | yes      | Password for the cookie-based admin auth.                          |
| `NEXT_PUBLIC_APP_URL` | no       | Public URL (e.g. `https://your-domain`).                           |

Without an `OPENROUTER_API_KEY`, the AI endpoints return a friendly "not
configured" error and the rest of the app works normally.

---

## Scripts

| Script              | What it does                                        |
| ------------------- | --------------------------------------------------- |
| `npm run dev`       | Start the Next.js dev server                        |
| `npm run build`     | Production build                                    |
| `npm run db:seed`   | Seed sample makes + car listings                    |
| `npm run db:reset`  | Drop & re-create the DB, re-run migrations + seed   |
| `npm run db:studio` | Open Prisma Studio to inspect/edit data             |

---

## Design system

The UI follows the **AutoListing** design system (`design-system/autolisting/`):

- **Aesthetic:** "Vibrant & Block-based" — premium dark, high contrast, geometric.
- **Palette:** primary `#1E293B` (dark) + accent `#DC2626` (action red) on a
  light `#F8FAFC` background. Tokens in [`app/globals.css`](./app/globals.css).
- **Type:** **Syncopate** (wide, tech display) + **Space Mono** (kinetic mono
  body), self-hosted via `next/font` (no runtime CDN, works in Docker).
- **Icons:** [`lucide-react`](https://lucide.dev) (no emoji icons).
- **A11y:** `cursor-pointer` on clickables, visible focus rings, 4.5:1 contrast,
  `prefers-reduced-motion` respected, mobile-first responsive.
- **Brand:** the logo (`public/logique-logo.png`) in the header.

---

## Internationalization (EN / ID)

Bilingual support is cookie-based so it works with server-rendered pages:

- `lib/i18n/dictionaries.ts` — the EN/ID string tables + pure `t()` translator.
- `lib/i18n/server.ts` — `getLocale()` reads the `locale` cookie (SSR).
- The `LanguageSwitcher` in the header writes the cookie and refreshes.

Default locale is English; switch to Indonesian with the **ID** toggle.

---

## Deployment (Docker + HTTPS)

The [`docker-compose.yml`](./docker-compose.yml) stack has two services:

- **`app`** — Next.js production image ([`Dockerfile`](./Dockerfile)) whose
  entrypoint runs `prisma migrate deploy` (and seeds on first run) before
  `next start`. SQLite lives on a persisted named volume.
- **`caddy`** — terminates TLS and reverse-proxies to the app on **https**.

**Self-signed (default — any server/IP, no domain):** the `Caddyfile` uses
`tls internal`, so `https://<server-ip>` works immediately. Browsers show a
certificate warning (expected for self-signed; the connection is encrypted).

**Real domain (automatic Let's Encrypt):** in [`Caddyfile`](./Caddyfile) change
`:443` to your domain and remove `tls internal` — Caddy provisions a real
certificate automatically.

```bash
docker compose up -d --build     # bring the stack up
docker compose logs -f app       # tail app logs (migrate/seed output)
docker compose down              # stop (keeps the db-data volume)
```

---

## Project structure

```
app/
  (public)/            # public storefront: browse (infinite scroll) + detail + promo modal
    layout.tsx         # mounts the first-visit promo modal
    page.tsx           # browse (hero, search, filters, CarList)
    cars/[id]/page.tsx # listing detail
  admin/               # login, dashboard (Kanban), cars/{new,edit}, makes
  api/
    auth/              # login / logout
    cars/              # list(paginated)/create, [id] CRUD, [id]/status
    makes/             # manufacturer catalog CRUD
    ai/                # analyze-listing (score+price+suggestedFields), generate-copy, buyer-insights
components/
  public/              # CarCard, CarList (infinite scroll), SearchBar, FilterPanel, PromoModal,
                       #   BuyerInsightsPanel, DealIntelligenceCard, InspectionChecklist
  admin/               # CarForm, Kanban{Board,Column,Card}, MakesManager, ListingAnalyzer,
                       #   HealthScoreBadge, LoginForm, LogoutButton, StatusBadge
  ui/                  # Toast
  Breadcrumbs.tsx, LanguageSwitcher.tsx, SiteHeader.tsx
lib/
  ai.ts                # OpenRouter wrapper (aiChat / isAiConfigured)
  i18n/                # dictionaries (EN/ID) + server locale reader
  prisma.ts            # Prisma client singleton (libSQL driver adapter)
  queries.ts           # public car queries (filters + pagination)
  auth.ts, validation.ts, format.ts, nav.ts, types.ts
prisma/                # schema.prisma (Car, Make) + migrations + seed.ts
proxy.ts               # guards /admin/* (Next.js 16's renamed "middleware")
design-system/         # AutoListing design-system spec (MASTER.md + page overrides)
Dockerfile, docker-compose.yml, Caddyfile, docker-entrypoint.sh
```

---

## Notes on the stack

The original brief targeted Next.js 15 + Prisma 5; `create-next-app@latest` and
`prisma@latest` now ship **Next.js 16** and **Prisma 7**, whose breaking changes
the code accounts for:

- **`proxy.ts` instead of `middleware.ts`** (Next 16 renamed Middleware to
  "Proxy"). Async `params` / `searchParams` / `cookies()` are `await`ed.
- **Prisma driver adapter** — Prisma 7's generator has no built-in query engine,
  so `lib/prisma.ts` wires the **libSQL** adapter to the SQLite file. The seed
  runs via **`tsx`** (the generated client is ESM); the seed command lives in
  `prisma.config.ts`.
- **AI via OpenRouter** — a single `lib/ai.ts` wrapper (`aiChat`) backs all three
  AI features (admin analyzer + ad copy, public buyer insights); the model is
  configurable via `OPENROUTER_MODEL`. Buyer insights are cached in the DB after
  first generation so repeat visitors see them instantly.
- **Number formatting** is manual grouping (not `Intl`) to avoid server/browser
  ICU differences causing hydration mismatches in prices/mileage.

See [`WRITEUP.md`](./WRITEUP.md) for design decisions, the addon rationale, and
how AI tooling was used.
