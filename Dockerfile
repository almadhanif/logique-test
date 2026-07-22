# syntax=docker/dockerfile:1
# Next.js production image for Logique Motors.
# Keeps devDependencies (prisma CLI, tsx, dotenv) so the entrypoint can run
# migrations + seed on first start.

FROM node:22-slim AS base

# openssl/certs: sometimes needed by Prisma's schema engine + font/cert fetches.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1) Copy manifests + prisma config/schema first to maximise layer caching.
COPY package*.json prisma.config.ts ./
COPY prisma ./prisma

# 2) Install deps. postinstall runs `prisma generate` (creates lib/generated/).
RUN npm ci

# 3) Copy the rest of the source and build.
COPY . .

# Build-time env (no DB connection happens during `next build`; pages are dynamic).
ENV DATABASE_URL="file:/app/data/dev.db" \
    NODE_ENV=production

# Regenerate the client in case copy ordering skipped postinstall.
RUN npx prisma generate
RUN npm run build

# 4) Runtime.
ENV PORT=3000 \
    HOSTNAME=0.0.0.0

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

# Runs `prisma migrate deploy` (+ seed on first run), then `next start`.
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
