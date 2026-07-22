import { cookies } from "next/headers";

// Cookie-based admin auth (demo-grade). The cookie is httpOnly so it can't be
// read from the browser, and it is only ever set after the password check passes.

export const SESSION_COOKIE = "admin_session";
const SESSION_VALUE = "true";

/** Compare a submitted password against the configured ADMIN_PASSWORD. */
export function verifyPassword(password: string): boolean {
  const configured = process.env.ADMIN_PASSWORD;
  // Fail closed if no password is configured.
  if (!configured) return false;
  return password === configured;
}

/**
 * Check the session cookie from a raw cookie value (used by proxy.ts, which
 * reads the cookie off the NextRequest object directly).
 */
export function isValidSessionValue(value: string | undefined): boolean {
  return value === SESSION_VALUE;
}

/**
 * Whether the current request is authenticated. Uses the async `cookies()`
 * helper — call from a Server Component or Route Handler.
 */
export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return isValidSessionValue(store.get(SESSION_COOKIE)?.value);
}

/** Cookie options for setting/clearing the session cookie. */
export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  // secure: true, // enable in production behind HTTPS
};
