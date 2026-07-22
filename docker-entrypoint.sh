#!/bin/sh
set -e

# Where the SQLite database lives (persisted via a docker volume).
DB_FILE="/app/data/dev.db"
mkdir -p /app/data

# Apply pending migrations (idempotent, non-destructive).
echo "▸ Applying database migrations…"
npx prisma migrate deploy

# Seed sample data on first run only (seed wipes + reinserts, so don't repeat it).
if [ ! -f "$DB_FILE" ] || [ ! -s "$DB_FILE" ]; then
  echo "▸ First run detected — seeding sample listings…"
  npm run db:seed || echo "  (seed skipped)"
else
  echo "▸ Existing database found — skipping seed."
fi

echo "▸ Starting Next.js on port ${PORT:-3000}…"
exec npx next start -p "${PORT:-3000}" -H "${HOSTNAME:-0.0.0.0}"
