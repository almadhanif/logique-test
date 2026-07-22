import { NextRequest } from "next/server";
import { fetchPublishedCarsPage, PAGE_SIZE, parseCarFilters } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { parseCarInput } from "@/lib/validation";

// GET /api/cars — public list endpoint. Returns only PUBLISHED cars, paginated.
// Query params (all optional):
//   search, make, yearMin, yearMax, priceMin, priceMax, mileageMax
//   page (1-based, default 1), pageSize (default 8)
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const filters = parseCarFilters(Object.fromEntries(params.entries()));
  const page = Math.max(1, Number(params.get("page") ?? "1") || 1);
  const pageSize = Math.max(
    1,
    Math.min(48, Number(params.get("pageSize") ?? String(PAGE_SIZE)) || PAGE_SIZE),
  );
  const result = await fetchPublishedCarsPage(filters, page, pageSize);
  return Response.json({
    cars: result.cars,
    total: result.total,
    page,
    pageSize,
    hasMore: result.hasMore,
  });
}

// POST /api/cars — admin only. Creates a new car (always as DRAFT).
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseCarInput(body);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 422 });
  }

  const car = await prisma.car.create({ data: { ...parsed.data, status: "DRAFT" } });
  return Response.json({ car }, { status: 201 });
}
