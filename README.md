# 🚗 Logique Motors — Used-Car Listing App

A full-stack used-car marketplace: a public browse/search site, an admin
**Kanban board** that moves listings through a `Draft → Published → Sold`
lifecycle, and two **Claude-powered** AI features — a listing analyzer
(marketability score + price range) and an ad-copy generator.

Built with **Next.js (App Router) · TypeScript · Prisma · SQLite · Tailwind CSS ·
Anthropic Claude API**.

---

## Run it two ways

### A) Docker (recommended for a server — includes HTTPS)

```bash
cp .env.example .env            # set ANTHROPIC_API_KEY + ADMIN_PASSWORD
docker compose up -d --build
```

Open **https://localhost** (or `https://<server-ip>`). The first run auto-applies
migrations, seeds sample listings, and Caddy terminates TLS. See
[Deployment (Docker + HTTPS)](#deployment-docker--https) below for the
self-signed vs. real-domain details.

### B) Local development

```bash
npm install                     # also runs `prisma generate`
cp .env.example .env.local      # set ANTHROPIC_API_KEY + ADMIN_PASSWORD
npx prisma migrate dev          # create the SQLite DB + schema
npm run db:seed                 # sample listings (Draft / Published / Sold)
npm run dev
```

| Area   | URL                          | Notes                                          |
| ------ | ---------------------------- | ---------------------------------------------- |
| Public | http://localhost:3000        | Browse, search and filter published cars.      |
| Admin  | http://localhost:3000/admin  | Redirects to login; password from `.env`.     |

**Admin flow:** create a listing (Draft) → fill notes → **✨ Analyze listing**
for a score + price range → save → drag the card across the board (Draft →
Published → Sold). Only Drafts can be deleted.

## Scripts

| Script              | What it does                                      |
| ------------------- | ------------------------------------------------- |
| `npm run dev`       | Start the Next.js dev server                      |
| `npm run build`     | Production build                                  |
| `npm run db:seed`   | Seed sample car listings                          |
| `npm run db:reset`  | Drop & re-create the DB, re-run migrations + seed |
| `npm run db:studio` | Open Prisma Studio to inspect/edit data           |

## Design system

The UI uses an **editorial automotive** aesthetic — deliberately avoiding the
generic "AI dashboard" look (no Inter, no purple gradients, no cookie-cutter
cards):

- **Type**: Fraunces (characterful display serif) paired with Manrope (UI),
  self-hosted via `next/font` (no runtime CDN, works in Docker).
- **Palette**: warm paper background, ink type, a single sharp **ember-orange**
  accent. Defined as tokens in [`app/globals.css`](./app/globals.css) (`@theme`).
- **Details**: subtle paper grain, staggered reveal-on-load, editorial monogram
  placeholders (the make's initial) instead of stock imagery.
- **Brand**: the Logique logo (`public/logique-logo.png`) in the header.

## Deployment (Docker + HTTPS)

The [`docker-compose.yml`](./docker-compose.yml) stack has two services:

- **`app`** — Next.js production image ([`Dockerfile`](./Dockerfile)) with an
  entrypoint that runs `prisma migrate deploy` (and seeds on first run) before
  `next start`. The SQLite database is on a persisted volume.
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

## Project structure

```
app/
  (public)/            # public browse + detail pages (route group, URL "/")
  admin/               # login, dashboard (Kanban), cars/new, cars/[id]/edit
  api/                 # auth, cars (CRUD + status), ai/{analyze-listing,generate-copy}
components/
  public/              # CarCard, SearchBar, FilterPanel
  admin/               # CarForm, Kanban{Board,Column,Card}, ListingAnalyzer, HealthScoreBadge, …
  ui/                  # Toast
lib/                   # prisma, anthropic, auth, queries, validation, format, nav, types
prisma/                # schema.prisma + seed.ts
proxy.ts               # guards /admin/* (Next.js 16's renamed "middleware")
Dockerfile, docker-compose.yml, Caddyfile, docker-entrypoint.sh
```

## Notes on the stack

The original brief targeted Next.js 15 + Prisma 5; `create-next-app@latest` and
`prisma@latest` now ship **Next.js 16** and **Prisma 7**, whose breaking changes
the code accounts for:

- **`proxy.ts` instead of `middleware.ts`** (Next 16 rename); async
  `params`/`searchParams`/`cookies()` are `await`ed throughout.
- **Prisma driver adapter** — Prisma 7's generator has no query engine, so
  `lib/prisma.ts` wires the **libSQL** adapter to the SQLite file. The seed runs
  via **`tsx`** (the generated client is ESM).
- **AI model** — the brief's `claude-haiku-3` isn't a real id; `claude-haiku-4-5`
  is used.

See [`WRITEUP.md`](./WRITEUP.md) for design decisions, the addon rationale, and
how AI tooling was used.
