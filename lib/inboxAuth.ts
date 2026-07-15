// ── Inbox password gate (pilot) ───────────────────────────────────────────────
//
// A single shared password (INBOX_PASSWORD) protects the /inbox page and its
// /api/inbox/* routes. There is no user store and no server-side session store:
// the HttpOnly session cookie holds an opaque SHA-256 token derived from the
// configured password, and both the login route and middleware.ts compute that
// token identically to validate a request. The raw password is never placed in
// the cookie. Rotating INBOX_PASSWORD invalidates every existing session.

export const INBOX_COOKIE = "inbox_session";

// 12h session — short enough for a pilot, long enough to avoid re-login churn.
export const INBOX_SESSION_MAX_AGE_S = 12 * 60 * 60;

/**
 * Deterministic opaque session token for a password. Uses Web Crypto so the
 * exact same code runs in the middleware runtime and in a Node route handler.
 */
export async function sessionTokenFor(password: string): Promise<string> {
  const data = new TextEncoder().encode(`inbox:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
