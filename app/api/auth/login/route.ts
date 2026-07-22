import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/auth";

// POST /api/auth/login — verify the admin password and set the session cookie.
export async function POST(request: Request) {
  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (!verifyPassword(password)) {
    return Response.json({ error: "Incorrect password" }, { status: 401 });
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, "true", sessionCookieOptions);

  return Response.json({ ok: true });
}
