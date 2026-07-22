import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import type { Status } from "@/lib/generated/prisma/client";

// Enforced lifecycle transitions: DRAFT -> PUBLISHED -> SOLD (no skipping).
const NEXT_STATUS: Record<Status, Status | null> = {
  DRAFT: "PUBLISHED",
  PUBLISHED: "SOLD",
  SOLD: null,
};

// PATCH /api/cars/[id]/status — admin only. Advances a car's lifecycle.
// Body: { status: "PUBLISHED" | "SOLD" }
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
  if (requested !== "PUBLISHED" && requested !== "SOLD") {
    return Response.json(
      { error: "status must be PUBLISHED or SOLD" },
      { status: 422 },
    );
  }

  const car = await prisma.car.findUnique({ where: { id }, select: { status: true } });
  if (!car) return Response.json({ error: "Not found" }, { status: 404 });

  const allowed = NEXT_STATUS[car.status];
  if (allowed !== requested) {
    return Response.json(
      {
        error: `Invalid transition: ${car.status} -> ${requested}. Allowed: ${car.status} -> ${allowed ?? "(terminal)"}.`,
      },
      { status: 409 },
    );
  }

  const updated = await prisma.car.update({
    where: { id },
    data: { status: requested },
  });
  return Response.json({ car: updated });
}
