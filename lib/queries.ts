import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

// Shared query helpers used by both the public browse page and the
// GET /api/cars route, so the filtering logic stays in one place.

export type CarListFilters = {
  search?: string;
  make?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  mileageMax?: number;
};

/** Parse raw query/search params (all strings) into typed filters. */
export function parseCarFilters(
  params: Record<string, string | string[] | undefined>,
): CarListFilters {
  const first = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  const num = (v: string | undefined) => {
    if (v === undefined || v === "") return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  return {
    search: first(params.search)?.trim() || undefined,
    make: first(params.make) || undefined,
    yearMin: num(first(params.yearMin)),
    yearMax: num(first(params.yearMax)),
    priceMin: num(first(params.priceMin)),
    priceMax: num(first(params.priceMax)),
    mileageMax: num(first(params.mileageMax)),
  };
}

/** Build the Prisma `where` clause for a public (PUBLISHED-only) car query. */
export function buildPublishedWhere(
  f: CarListFilters,
): Prisma.CarWhereInput {
  const hasYear = f.yearMin !== undefined || f.yearMax !== undefined;
  const hasPrice = f.priceMin !== undefined || f.priceMax !== undefined;

  return {
    status: "PUBLISHED",
    ...(f.search && {
      OR: [{ make: { contains: f.search } }, { model: { contains: f.search } }],
    }),
    ...(f.make && { make: f.make }),
    ...(hasYear && {
      year: {
        ...(f.yearMin !== undefined && { gte: f.yearMin }),
        ...(f.yearMax !== undefined && { lte: f.yearMax }),
      },
    }),
    ...(hasPrice && {
      price: {
        ...(f.priceMin !== undefined && { gte: f.priceMin }),
        ...(f.priceMax !== undefined && { lte: f.priceMax }),
      },
    }),
    ...(f.mileageMax !== undefined && { mileage: { lte: f.mileageMax } }),
  };
}

/** Fetch published cars matching the given filters, newest first. */
export async function fetchPublishedCars(f: CarListFilters) {
  return prisma.car.findMany({
    where: buildPublishedWhere(f),
    orderBy: { createdAt: "desc" },
  });
}

/** Distinct list of makes among published cars (for the filter dropdown). */
export async function fetchPublishedMakes(): Promise<string[]> {
  const rows = await prisma.car.findMany({
    where: { status: "PUBLISHED" },
    distinct: ["make"],
    select: { make: true },
    orderBy: { make: "asc" },
  });
  return rows.map((r) => r.make);
}
