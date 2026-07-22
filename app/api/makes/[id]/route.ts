import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

function normalize(s: unknown): string | null {
  return typeof s === "string" && s.trim() ? s.trim() : null;
}

// PATCH /api/makes/[id] — admin only. Updates name and/or country.
export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/makes/[id]">,
) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  let body: { name?: string; country?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const data: { name?: string; country?: string | null } = {};
  if (body.name !== undefined) {
    const name = body.name.trim();
    if (!name) return Response.json({ error: "name cannot be empty" }, { status: 422 });
    data.name = name;
  }
  if (body.country !== undefined) data.country = normalize(body.country);

  try {
    const make = await prisma.make.update({ where: { id }, data });
    return Response.json({ make });
  } catch {
    return Response.json({ error: "Make not found or name already in use" }, { status: 409 });
  }
}

// DELETE /api/makes/[id] — admin only.
// Cars store the make name as a plain string (no FK), so deleting a Make does
// not remove or break existing cars; it only removes it from the catalog.
export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/makes/[id]">,
) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    await prisma.make.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Make not found" }, { status: 404 });
  }
}
