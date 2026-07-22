import { NextRequest } from "next/server";
import { fetchPublishedCars, parseCarFilters } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { parseCarInput } from "@/lib/validation";

// GET /api/cars — public list endpoint. Returns only PUBLISHED cars.
// Supports the same query params as the browse page:
//   search, make, yearMin, yearMax, priceMin, priceMax, mileageMax
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const filters = parseCarFilters(Object.fromEntries(params.entries()));
  const cars = await fetchPublishedCars(filters);
  return Response.json({ cars });
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
