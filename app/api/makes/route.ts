import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

// GET /api/makes — admin only. Returns the manufacturer catalog.
export async function GET() {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const makes = await prisma.make.findMany({ orderBy: { name: "asc" } });
  return Response.json({ makes });
}

// POST /api/makes — admin only. Adds a manufacturer.
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { name?: string; country?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return Response.json({ error: "name is required" }, { status: 422 });
  }
  const country =
    typeof body.country === "string" && body.country.trim()
      ? body.country.trim()
      : null;

  try {
    const make = await prisma.make.create({ data: { name, country } });
    return Response.json({ make }, { status: 201 });
  } catch {
    return Response.json({ error: "Make already exists" }, { status: 409 });
  }
}
