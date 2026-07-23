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

  // mileageMax keeps its raw parsed value (even Infinity/NaN when the user
  // typed something absurd) so the query layer can detect an out-of-range
  // input and return 0 results instead of silently dropping the filter.
  const mileageRaw = (v: string | undefined) =>
    v === undefined || v === "" ? undefined : Number(v);

  return {
    search: first(params.search)?.trim() || undefined,
    make: first(params.make) || undefined,
    yearMin: num(first(params.yearMin)),
    yearMax: num(first(params.yearMax)),
    priceMin: num(first(params.priceMin)),
    priceMax: num(first(params.priceMax)),
    mileageMax: mileageRaw(first(params.mileageMax)),
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
    // Multi-word search: split into words, each word must match make OR model.
    // "wuling almaz" → AND[ (make~wuling | model~wuling), (make~almaz | model~almaz) ]
    ...(f.search && {
      AND: f.search
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => ({
          OR: [
            { make: { contains: word } },
            { model: { contains: word } },
          ],
        })),
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
    // Guard against non-finite values (overflow/NaN) so this never emits a
    // broken `lte: Infinity` clause — the query layer short-circuits those.
    ...(f.mileageMax !== undefined &&
      Number.isFinite(f.mileageMax) && { mileage: { lte: f.mileageMax } }),
  };
}

/** Page size for the public browse grid (infinite scroll). */
export const PAGE_SIZE = 8;

/** Fetch one page of published cars matching the filters, newest first. */
export async function fetchPublishedCarsPage(
  f: CarListFilters,
  page = 1,
  pageSize: number = PAGE_SIZE,
) {
  // Mileage guard: if the requested max is non-finite (overflow/absurd input)
  // OR exceeds the highest mileage in the catalog, return no results. This
  // keeps the filter predictable — previously overflow dropped the filter and
  // returned every car, while precision-loss on huge ints returned 0
  // inconsistently. Now any value above the catalog max consistently yields 0.
  if (f.mileageMax !== undefined) {
    const agg = await prisma.car.aggregate({
      where: { status: "PUBLISHED" },
      _max: { mileage: true },
    });
    const maxMileage = agg._max.mileage ?? 0;
    if (!Number.isFinite(f.mileageMax) || f.mileageMax > maxMileage) {
      return { cars: [], total: 0, hasMore: false };
    }
  }

  const where = buildPublishedWhere(f);
  const [cars, total] = await Promise.all([
    prisma.car.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: pageSize,
      skip: (page - 1) * pageSize,
    }),
    prisma.car.count({ where }),
  ]);
  return { cars, total, hasMore: page * pageSize < total };
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
