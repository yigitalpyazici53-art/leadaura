import { updateState } from "./conversationState";
import type { ConversationState } from "./conversationState";
import { getBookingUrl, formatBookingLinkMessage } from "./clinicConfig";

// Why this is a shared module and not inline route code:
// Both outbound webhook routes (Twilio SMS/WhatsApp and Meta WhatsApp) must run the
// SAME booking-link decision after a conversation reaches "complete". Duplicating the
// guard in two places is how it drifted before. Centralizing it here also gives the
// tests a real seam: the outbound sender is injected, so a test drives the ACTUAL
// production decision (runtime URL read, skip reasons, flag-after-success ordering)
// rather than a helper stand-in.

export type BookingHandoffChannel = "twilio" | "meta";

// Safe, enumerated reasons a handoff was not attempted. Never carries PII.
export type BookingHandoffSkipReason = "no_booking_url" | "not_complete" | "already_sent";

export interface BookingHandoffResult {
  attempted: boolean;
  sent: boolean;
  skippedReason: BookingHandoffSkipReason | null;
}

export interface BookingHandoffParams {
  /** Raw recipient key exactly as the pipeline stored it (may carry a "whatsapp:" prefix). */
  from: string;
  stateAfter: ConversationState;
  channel: BookingHandoffChannel;
  /** Outbound sender for this channel: sendSms (Twilio) or sendWhatsAppText (Meta). */
  send: (to: string, body: string) => Promise<void>;
}

// Decides and (when appropriate) performs the booking-link follow-up for a completed
// conversation. The booking URL is read at REQUEST time via getBookingUrl() so a value
// configured in the deployment is always seen. The bookingLinkSent flag is written ONLY
// after the outbound send resolves — a send failure leaves it false so a later turn
// retries. Logs are deliberately free of URL, phone number, message body, and secrets.
export async function handleBookingHandoff(
  params: BookingHandoffParams
): Promise<BookingHandoffResult> {
  const { from, stateAfter, channel, send } = params;
  const bookingUrl = getBookingUrl();

  // Diagnostic snapshot emitted immediately before the decision, for BOTH channels.
  // Booleans/enums only — no URL, no phone, no message text, no secrets.
  console.log(
    "[BookingHandoff]",
    JSON.stringify({
      hasBookingUrl: Boolean(bookingUrl),
      stage: stateAfter.stage,
      bookingLinkSent: Boolean(stateAfter.bookingLinkSent),
      language: stateAfter.detectedLanguage,
      channel,
      recipientIsWhatsapp: from.startsWith("whatsapp:"),
    })
  );

  if (!bookingUrl) {
    console.log("[BookingHandoff] booking handoff skipped reason=no_booking_url");
    return { attempted: false, sent: false, skippedReason: "no_booking_url" };
  }
  if (stateAfter.stage !== "complete") {
    console.log("[BookingHandoff] booking handoff skipped reason=not_complete");
    return { attempted: false, sent: false, skippedReason: "not_complete" };
  }
  if (stateAfter.bookingLinkSent) {
    console.log("[BookingHandoff] booking handoff skipped reason=already_sent");
    return { attempted: false, sent: false, skippedReason: "already_sent" };
  }

  console.log("[BookingHandoff] booking handoff attempting");
  try {
    // `from` is passed to the sender unchanged so a Twilio "whatsapp:" prefix is
    // preserved (WhatsApp replies must keep the transport prefix).
    await send(from, formatBookingLinkMessage(bookingUrl, stateAfter.detectedLanguage));
    // Flag written only after a SUCCESSFUL send — a failure above throws before this.
    await updateState(from, { bookingLinkSent: true });
    console.log("[BookingHandoff] booking handoff sent");
    return { attempted: true, sent: true, skippedReason: null };
  } catch (err) {
    console.error(
      "[BookingHandoff] booking handoff failed:",
      err instanceof Error ? err.message : "unknown"
    );
    return { attempted: true, sent: false, skippedReason: null };
  }
}
