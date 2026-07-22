import { NextResponse } from "next/server";
import { getStateStorageMode, updateState } from "@/lib/conversationState";
import { maskPhone } from "@/lib/sanitize";

// Authenticated pause/resume wrapper for the pilot inbox. Protected by
// middleware.ts (the /api/inbox/* session-cookie guard).
//
// The public /api/handoff endpoint is gated by TEST_WEBHOOK_SECRET, which must
// never be exposed to the browser. Rather than have the page call /api/handoff
// with that secret, this thin wrapper performs the exact same pause/resume
// server-side — it sets humanHandoff on the conversation state directly, the
// same single field /api/handoff writes. No new behaviour, just an
// already-authenticated surface the inbox UI can safely call.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ phone: string }> }
): Promise<NextResponse> {
  const { phone: raw } = await params;
  const phone = decodeURIComponent(raw ?? "").trim();
  if (!phone) {
    return NextResponse.json({ ok: false, error: "Missing phone" }, { status: 400 });
  }

  let parsed: { paused?: boolean };
  try {
    parsed = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof parsed.paused !== "boolean") {
    return NextResponse.json(
      { ok: false, error: "Missing or invalid paused (boolean)" },
      { status: 400 }
    );
  }

  const stateStorage = getStateStorageMode();

  try {
    await updateState(phone, { humanHandoff: parsed.paused });
    console.log(
      `[Inbox] handoff set phone=${maskPhone(phone)} humanHandoff=${parsed.paused} stateStorage=${stateStorage}`
    );
    return NextResponse.json({ ok: true, phone, humanHandoff: parsed.paused, stateStorage });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error(`[Inbox] handoff update failed for phone=${maskPhone(phone)}: ${error}`);
    return NextResponse.json({ ok: false, error, stateStorage }, { status: 500 });
  }
}
