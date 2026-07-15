import { NextRequest, NextResponse } from "next/server";
import { INBOX_COOKIE, INBOX_SESSION_MAX_AGE_S, sessionTokenFor } from "@/lib/inboxAuth";

// Password gate for the pilot inbox. On a correct password this sets an HttpOnly
// session cookie; middleware.ts validates that cookie on every /inbox and
// /api/inbox/* request. This route is deliberately exempt from the middleware
// guard (otherwise you could never log in).
export async function POST(req: NextRequest): Promise<NextResponse> {
  const configured = process.env.INBOX_PASSWORD;
  if (!configured) {
    return NextResponse.json(
      { ok: false, error: "INBOX_PASSWORD not configured on server" },
      { status: 500 }
    );
  }

  let parsed: { password?: string };
  try {
    parsed = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  if (!parsed.password || parsed.password !== configured) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const token = await sessionTokenFor(configured);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(INBOX_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: INBOX_SESSION_MAX_AGE_S,
  });
  return res;
}
