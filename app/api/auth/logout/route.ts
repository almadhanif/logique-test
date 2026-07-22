import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth";

// POST /api/auth/logout — clear the session cookie.
export async function POST() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  return Response.json({ ok: true });
}
