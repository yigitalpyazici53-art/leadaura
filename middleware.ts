import { NextRequest, NextResponse } from "next/server";
import { INBOX_COOKIE, sessionTokenFor } from "@/lib/inboxAuth";

// Guards the pilot inbox: the /inbox page and every /api/inbox/* route require a
// valid session cookie (set by POST /api/inbox/login). Unauthenticated page
// requests redirect to the login view; unauthenticated API requests get 401.
// The login endpoint and the login page are exempt so they stay reachable.
export const config = {
  matcher: ["/inbox/:path*", "/api/inbox/:path*"],
};

const LOGIN_PAGE = "/inbox/login";
const LOGIN_API = "/api/inbox/login";

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api/inbox");

  // Never guard the login surfaces themselves (avoids a redirect loop).
  if (pathname === LOGIN_PAGE || pathname === LOGIN_API) {
    return NextResponse.next();
  }

  const password = process.env.INBOX_PASSWORD;
  if (!password) {
    // Misconfiguration — fail closed.
    if (isApi) {
      return NextResponse.json(
        { ok: false, error: "INBOX_PASSWORD not configured" },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL(LOGIN_PAGE, req.url));
  }

  const cookie = req.cookies.get(INBOX_COOKIE)?.value;
  const expected = await sessionTokenFor(password);

  if (cookie && cookie === expected) {
    return NextResponse.next();
  }

  if (isApi) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.redirect(new URL(LOGIN_PAGE, req.url));
}
