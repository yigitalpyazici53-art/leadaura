import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { sendOutbound } from "@/lib/outboundSend";
import { sanitizeSmsText } from "@/lib/sanitize";
import { logToSheet } from "@/lib/googleSheets";

const MISSED_CALL_SMS = sanitizeSmsText(
  "Merhaba! Aramanızı aldık ama şu an müsait olamadık. Size kısa süre içinde dönüş yapacağız. Nasıl yardımcı olabiliriz?"
);

const TWIML_RESPONSE = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="tr-TR">Aramanız için teşekkürler. Sizi kısa sürede arayacağız.</Say>
  <Hangup/>
</Response>`;

export async function POST(req: NextRequest): Promise<NextResponse> {
  console.log("[Voice] Incoming call webhook");

  let from = "";
  let to = "";
  let callSid = "";
  let params = new URLSearchParams();

  try {
    const body = await req.text();
    params = new URLSearchParams(body);
    from    = params.get("From")    ?? "";
    to      = params.get("To")      ?? "";
    callSid = params.get("CallSid") ?? "";
  } catch (err) {
    console.error("[Voice ERROR] Failed to parse request body:", err instanceof Error ? err.message : "unknown");
    return new NextResponse(TWIML_RESPONSE, {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  }

  console.log(`[Voice] From: ${from} | To: ${to} | CallSid: ${callSid}`);

  // ── Validate Twilio signature in production ──────────────────────────────
  // Mirrors the incoming-sms route: an unsigned/forged POST must not be able to
  // trigger an outbound SMS to an attacker-chosen number.
  if (process.env.NODE_ENV === "production") {
    try {
      const authToken        = process.env.TWILIO_AUTH_TOKEN ?? "";
      const twilioSignature  = req.headers.get("x-twilio-signature") ?? "";
      const configuredUrl    = process.env.WEBHOOK_URL;
      const urlForValidation = configuredUrl ?? req.url;

      if (!configuredUrl) {
        console.warn(`[Voice] WEBHOOK_URL not set — falling back to req.url=${req.url}`);
      }

      const paramsObj: Record<string, string> = {};
      for (const [key, value] of params.entries()) paramsObj[key] = value;

      const isValid = twilio.validateRequest(authToken, twilioSignature, urlForValidation, paramsObj);
      if (!isValid) {
        console.warn(
          `[Voice] signature failed — url-used=${urlForValidation} req-url=${req.url} sig-len=${twilioSignature.length}`
        );
        return new NextResponse("Forbidden", { status: 403 });
      }
      console.log("[Voice] signature ok");
    } catch (sigErr) {
      console.error("[Voice] Signature validation threw:", sigErr instanceof Error ? sigErr.message : sigErr);
      return new NextResponse("Forbidden", { status: 403 });
    }
  } else {
    console.log("[Voice] signature disabled (non-production)");
  }
  console.log(`[Voice] Sending missed-call SMS (${MISSED_CALL_SMS.length} chars): ${MISSED_CALL_SMS}`);

  // Plain-SMS send through the compliance gate: window rules don't apply to
  // SMS, but pacing, rate limits, and the audit trail do.
  try {
    const smsResult = await sendOutbound({
      to: from,
      body: MISSED_CALL_SMS,
      kind: "system",
      channel: "twilio",
      threadKey: from,
    });
    console.log(
      `[Voice] Missed-call SMS to ${from} sent=${smsResult.sent} decision=${smsResult.decision}`
    );
  } catch (err) {
    console.error("[Voice] Failed to send missed-call SMS:", err);
  }

  logToSheet({
    createdAt: new Date().toISOString(),
    source: "missed_call",
    name: "",
    phone: from,
    service: "",
    preferredDate: "",
    preferredTime: "",
    location: "",
    urgency: "",
    leadScore: "",
    intent: "missed_call",
    notes: "",
    conversationSummary: "(missed call)",
    status: "new",
  }).catch((err) => {
    console.error("[Voice] Sheets log error:", err);
  });

  return new NextResponse(TWIML_RESPONSE, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}
