import { PrismaClient } from "./generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

// Prisma 7's generator has no built-in query engine, so a "driver adapter" is
// required. For SQLite we use the libSQL adapter, which reads a `file:` URL for
// a local database (and could also target a remote Turso/libSQL instance).
function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and run `npx prisma migrate dev`.",
    );
  }
  // PrismaLibSql takes a config object directly (url + optional authToken).
  const adapter = new PrismaLibSql({ url });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

// Singleton: reuse the client across hot-reloads in dev so we don't exhaust
// database connections.
// https://www.prisma.io/docs/guides/nextjs#best-practice-for-instantiating-prismaclient-with-nextjs
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
