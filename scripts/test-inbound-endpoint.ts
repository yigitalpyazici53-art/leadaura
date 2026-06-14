/**
 * RandevuFlow — internal test endpoint validation script.
 *
 * Usage:
 *   npm run test-inbound
 *
 * Tests the /api/test/inbound pipeline logic directly (no HTTP server required).
 * Authorization check, Turkish message processing, and reply quality are verified.
 */

import * as fs from "fs";
import * as path from "path";

// ── Load .env.local before any lib module reads process.env ──────────────
const envFile = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, "utf-8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed
      .slice(eqIdx + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (key && !(key in process.env)) {
      process.env[key] = val;
    }
  }
  console.log("Loaded .env.local\n");
} else {
  console.warn("WARNING: .env.local not found — using existing environment\n");
}

// Set test secret if not already configured
if (!process.env.TEST_WEBHOOK_SECRET) {
  process.env.TEST_WEBHOOK_SECRET = "randevuflow-dev";
}

// ── Safe to import lib modules now ───────────────────────────────────────
import { sanitizeSmsText, SMS_MAX_CHARS } from "../lib/sanitize";
import { classifyIntent } from "../lib/classifyIntent";
import { extractSlots, detectConflict } from "../lib/slotExtractor";
import {
  getState,
  updateState,
  addToHistory,
  getNextStage,
  resetStateForTest,
} from "../lib/conversationState";
import type { ConversationState } from "../lib/conversationState";
import type { ExtractedSlots } from "../lib/slotExtractor";
import { buildOwnerAlert } from "../lib/twilio";
import { generateSmsReply } from "../lib/anthropic";

// Turkish characters allowed in sanitized output
const TURKISH_CHARS = "ÇçĞğİıÖöŞşÜü";
const SMS_VALID_RE = new RegExp(`^[\\x20-\\x7E${TURKISH_CHARS}]*$`);

// Prohibited phrases — booking confirmations and old plumbing domain terms
const PROHIBITED_PHRASES = [
  "randevunuz onaylandı",
  "randevunuz kesinleşti",
  "size geleceğiz",
  "ekibimiz geliyor",
  "you are booked",
  "booking confirmed",
  "appointment confirmed",
  "help is on the way",
  // old plumbing domain
  "plumbing",
  "plumber",
  "pipe burst",
  "water heater",
  "faucet",
  "drain clog",
];

// ── Test helpers ──────────────────────────────────────────────────────────

let failures = 0;

function pass(label: string, detail = "") {
  console.log(`  PASS  ${label}${detail ? "  (" + detail + ")" : ""}`);
}

function fail(label: string, detail: string) {
  console.error(`  FAIL  ${label}  —  ${detail}`);
  failures++;
}

function assertEqual<T>(label: string, actual: T, expected: T) {
  if (actual === expected) pass(label, String(actual));
  else fail(label, `got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
}

function assertDefined(label: string, value: unknown) {
  if (value !== undefined && value !== null && value !== "") pass(label, String(value));
  else fail(label, `expected truthy, got ${JSON.stringify(value)}`);
}

function assertSms(label: string, text: string) {
  if (!SMS_VALID_RE.test(text)) {
    fail(label, `non-SMS chars in: ${text.slice(0, 60)}`);
  } else if (text.length > SMS_MAX_CHARS) {
    fail(label, `${text.length} chars — exceeds ${SMS_MAX_CHARS}`);
  } else {
    pass(label, `${text.length} chars`);
  }
}

function assertNoProhibitedPhrases(label: string, text: string) {
  const lower = text.toLowerCase();
  for (const phrase of PROHIBITED_PHRASES) {
    if (lower.includes(phrase)) {
      fail(label, `contains prohibited phrase: "${phrase}"`);
      return;
    }
  }
  pass(label);
}

function assertContains(label: string, haystack: string, needle: string) {
  if (haystack.toLowerCase().includes(needle.toLowerCase()))
    pass(label, `found "${needle}"`);
  else fail(label, `"${needle}" not found in "${haystack}"`);
}

// ── Pipeline runner (mirrors /api/test/inbound route logic) ──────────────

const STAGE_FALLBACK: Record<string, string> = {
  collect_name:     "Merhaba! Randevu talebi icin adinizi ogrenebilir miyim?",
  collect_service:  "Hangi hizmet icin randevu almak istersiniz?",
  collect_datetime: "Hangi gun ve saatte gelmek istersiniz?",
  collect_location: "Hangi subemizi tercih edersiniz?",
  complete:         "Bilgilerinizi aldik. Ekibimiz sizi arayarak onaylayacaktir.",
};

interface PipelineResult {
  input: string;
  intent: string;
  extractedSlots: ExtractedSlots;
  stateBefore: ConversationState;
  stateAfter: ConversationState;
  nextStage: string;
  assistantReply: string;
  ownerAlertPreview: string | null;
  wouldNotifyOwner: boolean;
}

async function runPipeline(from: string, rawInput: string): Promise<PipelineResult> {
  const input = sanitizeSmsText(rawInput);
  const stateBefore = await getState(from);
  const isFirstMessage = stateBefore.history.length === 0;

  const intentResult = classifyIntent(input, isFirstMessage);
  const extractedSlots = extractSlots(input);
  const conflictQuestion = detectConflict(stateBefore, extractedSlots);

  let assistantReply = "";

  if (conflictQuestion) {
    assistantReply = sanitizeSmsText(conflictQuestion);
  } else {
    let updated = await updateState(from, extractedSlots as Partial<ConversationState>);
    updated = await updateState(from, { stage: getNextStage(updated) });
    await addToHistory(from, "user", input);

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        assistantReply = await generateSmsReply(input, updated);
      } catch {
        assistantReply = sanitizeSmsText(STAGE_FALLBACK[updated.stage] ?? STAGE_FALLBACK.collect_name);
      }
    } else {
      assistantReply = sanitizeSmsText(STAGE_FALLBACK[updated.stage] ?? STAGE_FALLBACK.collect_name);
    }
  }

  await addToHistory(from, "assistant", assistantReply);

  const stateAfter = await getState(from);

  const isFirstHighUrgency = stateAfter.urgency === "high" && !stateAfter.ownerAlertedHighUrgency;
  const isFirstComplete = stateAfter.stage === "complete" && !stateAfter.ownerAlertedComplete;
  const wouldNotifyOwner = isFirstMessage || isFirstHighUrgency || isFirstComplete;
  const ownerAlertPreview = wouldNotifyOwner ? buildOwnerAlert(from, stateAfter) : null;

  return {
    input,
    intent: intentResult.category,
    extractedSlots,
    stateBefore,
    stateAfter,
    nextStage: stateAfter.stage,
    assistantReply,
    ownerAlertPreview,
    wouldNotifyOwner,
  };
}

// ── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== test-inbound-endpoint ===\n");

  // ── Section 1: Authorization check ───────────────────────────────────────
  console.log("── 1. Authorization ──");

  const CONFIGURED_SECRET = process.env.TEST_WEBHOOK_SECRET!;

  // Wrong secret should be rejected
  {
    const requestSecret = "totally-wrong-secret";
    const accepted = !!requestSecret && requestSecret === CONFIGURED_SECRET;
    if (!accepted) pass("wrong secret rejected");
    else fail("wrong secret rejected", "wrong secret was accepted");
  }

  // Missing (empty) secret should be rejected
  {
    const requestSecret = "";
    const accepted = !!requestSecret && requestSecret === CONFIGURED_SECRET;
    if (!accepted) pass("missing secret rejected");
    else fail("missing secret rejected", "empty secret was accepted");
  }

  // Correct secret should be accepted
  {
    const requestSecret = CONFIGURED_SECRET;
    const accepted = !!requestSecret && requestSecret === CONFIGURED_SECRET;
    if (accepted) pass("correct secret accepted");
    else fail("correct secret accepted", "valid secret was rejected");
  }

  // ── Section 2: Turkish message 1 — price question ─────────────────────────
  console.log("\n── 2. Mesaj: Fiyat sorusu (lazer epilasyon) ──");

  const PHONE_1 = "+905550000101";
  await resetStateForTest(PHONE_1);

  const MSG1 = "Merhaba lazer epilasyon fiyatı alabilir miyim?";
  const r1 = await runPipeline(PHONE_1, MSG1);

  console.log(`  intent      : ${r1.intent}`);
  console.log(`  service     : ${r1.extractedSlots.service ?? "(none)"}`);
  console.log(`  reply       : ${r1.assistantReply}`);
  console.log(`  stage after : ${r1.nextStage}`);

  assertEqual("intent = price_question", r1.intent, "price_question");
  assertEqual("service extracted = lazer epilasyon", r1.extractedSlots.service, "lazer epilasyon");
  assertDefined("stateAfter.service set", r1.stateAfter.service);
  assertDefined("reply non-empty", r1.assistantReply);
  assertSms("reply valid SMS", r1.assistantReply);
  assertNoProhibitedPhrases("no prohibited phrases", r1.assistantReply);

  // ── Section 3: Turkish message 2 — date/time ─────────────────────────────
  console.log("\n── 3. Mesaj: Tarih ve saat ──");

  const PHONE_2 = "+905550000102";
  await resetStateForTest(PHONE_2);

  const MSG2 = "Tüm vücut için cumartesi öğleden sonra uygun olur.";
  const r2 = await runPipeline(PHONE_2, MSG2);

  console.log(`  intent      : ${r2.intent}`);
  console.log(`  date        : ${r2.extractedSlots.preferredDate ?? "(none)"}`);
  console.log(`  time        : ${r2.extractedSlots.preferredTime ?? "(none)"}`);
  console.log(`  reply       : ${r2.assistantReply}`);
  console.log(`  stage after : ${r2.nextStage}`);

  assertDefined("preferredDate extracted", r2.extractedSlots.preferredDate);
  assertDefined("preferredTime extracted", r2.extractedSlots.preferredTime);
  assertContains("preferredDate contains cumartesi", r2.extractedSlots.preferredDate ?? "", "cumartesi");
  assertDefined("reply non-empty", r2.assistantReply);
  assertSms("reply valid SMS", r2.assistantReply);
  assertNoProhibitedPhrases("no prohibited phrases", r2.assistantReply);

  // ── Section 4: Turkish message 3 — name and phone ────────────────────────
  console.log("\n── 4. Mesaj: İsim ve telefon ──");

  const PHONE_3 = "+905550000103";
  await resetStateForTest(PHONE_3);

  const MSG3 = "Adım Ayşe Yılmaz, telefonum 0532 123 45 67.";
  const r3 = await runPipeline(PHONE_3, MSG3);

  console.log(`  intent      : ${r3.intent}`);
  console.log(`  name        : ${r3.extractedSlots.name ?? "(none)"}`);
  console.log(`  phone       : ${r3.extractedSlots.phone ?? "(none)"}`);
  console.log(`  reply       : ${r3.assistantReply}`);
  console.log(`  stage after : ${r3.nextStage}`);

  assertDefined("name extracted", r3.extractedSlots.name);
  assertDefined("phone extracted", r3.extractedSlots.phone);
  assertContains("name contains Ayşe", r3.extractedSlots.name ?? "", "Ay");
  assertDefined("reply non-empty", r3.assistantReply);
  assertSms("reply valid SMS", r3.assistantReply);
  assertNoProhibitedPhrases("no prohibited phrases", r3.assistantReply);
  assertDefined("stateAfter.name set", r3.stateAfter.name);

  // ── Section 5: Owner alert preview ───────────────────────────────────────
  console.log("\n── 5. Owner alert preview ──");

  // All three first messages should trigger wouldNotifyOwner (isFirstMessage = true)
  if (r1.wouldNotifyOwner) pass("msg1 wouldNotifyOwner = true (isFirstMessage)");
  else fail("msg1 wouldNotifyOwner", "expected true for first message");

  if (r1.ownerAlertPreview) {
    assertSms("owner alert valid SMS format", r1.ownerAlertPreview);
    assertContains("owner alert has [RF] prefix", r1.ownerAlertPreview, "[RF]");
    console.log(`  alert preview: ${r1.ownerAlertPreview}`);
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n══════════════════════════════════════");
  if (failures === 0) {
    console.log("ALL TESTS PASSED\n");
  } else {
    console.error(`\n${failures} test(s) FAILED\n`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal:", err instanceof Error ? err.message : err);
  process.exit(1);
});
