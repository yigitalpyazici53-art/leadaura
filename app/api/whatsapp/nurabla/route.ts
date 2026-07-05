/**
 * Nurabla Karadeniz Restaurant — isolated Twilio WhatsApp webhook.
 *
 * This endpoint is completely independent from the clinic / laser conversation
 * flow. It receives Twilio WhatsApp webhook POSTs, reads the "Body" form field,
 * and replies with Nurabla's location and/or menu information as TwiML.
 *
 * It deliberately does NOT touch conversation state, the inbound pipeline, or
 * any clinic module.
 */

import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { buildNurablaReply, NURABLA_FALLBACK } from "@/lib/businesses/nurabla";

const { MessagingResponse } = twilio.twiml;

/** Build a TwiML XML response containing a single WhatsApp message. */
function twimlResponse(message: string): NextResponse {
  const twiml = new MessagingResponse();
  twiml.message(message);
  return new NextResponse(twiml.toString(), {
    status: 200,
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // ── Parse the Twilio form body and read the incoming message ────────────
    let body = "";
    try {
      const raw = await req.text();
      const params = new URLSearchParams(raw);
      body = params.get("Body") ?? "";
    } catch (parseErr) {
      console.error(
        "[NURABLA] Failed to parse request body:",
        parseErr instanceof Error ? parseErr.message : "unknown"
      );
      return twimlResponse(NURABLA_FALLBACK);
    }

    const reply = buildNurablaReply(body);
    console.log(`[NURABLA] body-len=${body.length} reply-len=${reply.length}`);
    return twimlResponse(reply);
  } catch (err) {
    console.error(
      "[NURABLA] Unexpected error:",
      err instanceof Error ? err.message : err
    );
    return twimlResponse(NURABLA_FALLBACK);
  }
}
