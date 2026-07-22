import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { parseCarInput } from "@/lib/validation";

// GET /api/cars/[id] — admin only. Returns a car of any status.
export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/cars/[id]">,
) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const car = await prisma.car.findUnique({ where: { id } });
  if (!car) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ car });
}

// PATCH /api/cars/[id] — admin only. Updates editable fields.
export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/cars/[id]">,
) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;

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

  const car = await prisma.car.update({
    where: { id },
    // Only overwrite adCopy when the client sent one; otherwise leave it as-is.
    data: parsed.data.adCopy
      ? parsed.data
      : { ...parsed.data, adCopy: undefined },
  });
  return Response.json({ car });
}

// DELETE /api/cars/[id] — admin only. Allowed only while the car is a DRAFT.
export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/cars/[id]">,
) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;

  const car = await prisma.car.findUnique({ where: { id }, select: { status: true } });
  if (!car) return Response.json({ error: "Not found" }, { status: 404 });
  if (car.status !== "DRAFT") {
    return Response.json(
      { error: "Only draft listings can be deleted." },
      { status: 409 },
    );
  }

  await prisma.car.delete({ where: { id } });
  return Response.json({ ok: true });
}
