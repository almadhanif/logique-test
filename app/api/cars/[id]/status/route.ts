import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import type { Status } from "@/lib/generated/prisma/client";

// Admins can move a listing freely between any pipeline status — no enforced
// one-way lifecycle. (Previously only DRAFT -> PUBLISHED -> SOLD was allowed,
// which blocked corrections like moving a car back to DRAFT.)
const VALID_STATUSES: ReadonlySet<Status> = new Set([
  "DRAFT",
  "PUBLISHED",
  "SOLD",
]);

// PATCH /api/cars/[id]/status — admin only. Sets a car's pipeline status.
// Body: { status: "DRAFT" | "PUBLISHED" | "SOLD" }
export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/cars/[id]/status">,
) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;

  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const requested = body.status;
  if (!requested || !VALID_STATUSES.has(requested as Status)) {
    return Response.json(
      { error: "status must be DRAFT, PUBLISHED, or SOLD" },
      { status: 422 },
    );
  }

  const car = await prisma.car.findUnique({ where: { id }, select: { status: true } });
  if (!car) return Response.json({ error: "Not found" }, { status: 404 });

  // No-op if the status is unchanged.
  if (car.status === requested) {
    return Response.json({ car });
  }

  const updated = await prisma.car.update({
    where: { id },
    data: { status: requested as Status },
  });
  return Response.json({ car: updated });
}
