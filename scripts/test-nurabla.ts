/**
 * Nurabla Karadeniz Restaurant — isolated webhook intent tests.
 *
 * Usage:
 *   npm run test-nurabla
 *
 * Exercises the pure intent-detection / reply-building logic used by the
 * isolated Twilio WhatsApp webhook (app/api/whatsapp/nurabla/route.ts).
 * Does NOT hit the network or Twilio.
 */

import {
  buildNurablaReply,
  detectNurablaIntent,
  NURABLA,
  NURABLA_FALLBACK,
} from "../lib/businesses/nurabla";

// ── Test helpers ──────────────────────────────────────────────────────────────

let failures = 0;

function pass(label: string, detail = "") {
  console.log(`  PASS  ${label}${detail ? "  (" + detail + ")" : ""}`);
}

function fail(label: string, detail: string) {
  console.error(`  FAIL  ${label}  —  ${detail}`);
  failures++;
}

function assertTrue(label: string, actual: boolean) {
  if (actual) pass(label);
  else fail(label, `expected true, got false`);
}

function assertEqual<T>(label: string, actual: T, expected: T) {
  if (actual === expected) pass(label, String(actual));
  else fail(label, `got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
}

// ── 1. Location question ──────────────────────────────────────────────────────
console.log("\n1. Location question");
for (const msg of ["konum", "Adres", "nerede", "Nasıl gelirim?", "yol tarifi", "harita"]) {
  const intent = detectNurablaIntent(msg);
  assertTrue(`"${msg}" → location intent`, intent.location && !intent.menu);
}
{
  const reply = buildNurablaReply("konum");
  assertTrue("location reply contains address placeholder", reply.includes(NURABLA.address));
  assertTrue("location reply contains maps link", reply.includes(NURABLA.mapsUrl));
  assertTrue("location reply omits menu link", !reply.includes(NURABLA.menuUrl));
}

// ── 2. Menu question ──────────────────────────────────────────────────────────
console.log("\n2. Menu question");
for (const msg of ["menü", "menu", "MENÜ", "fiyat", "yemekler", "ne var", "kahvaltı"]) {
  const intent = detectNurablaIntent(msg);
  assertTrue(`"${msg}" → menu intent`, intent.menu && !intent.location);
}
{
  const reply = buildNurablaReply("menü");
  assertTrue("menu reply contains menu link", reply.includes(NURABLA.menuUrl));
  assertTrue("menu reply omits maps link", !reply.includes(NURABLA.mapsUrl));
}

// ── 3. Both location and menu ─────────────────────────────────────────────────
console.log("\n3. Both location and menu");
{
  const msg = "konum ve menü lütfen";
  const intent = detectNurablaIntent(msg);
  assertTrue(`"${msg}" → both intents`, intent.location && intent.menu);
  const reply = buildNurablaReply(msg);
  assertTrue("both reply contains address", reply.includes(NURABLA.address));
  assertTrue("both reply contains maps link", reply.includes(NURABLA.mapsUrl));
  assertTrue("both reply contains menu link", reply.includes(NURABLA.menuUrl));
}

// ── 4. Unsupported question ───────────────────────────────────────────────────
console.log("\n4. Unsupported question");
for (const msg of ["rezervasyon yapmak istiyorum", "teşekkürler", "iş başvurusu"]) {
  const intent = detectNurablaIntent(msg);
  assertTrue(`"${msg}" → no intent`, !intent.location && !intent.menu);
  assertEqual(`"${msg}" → fallback reply`, buildNurablaReply(msg), NURABLA_FALLBACK);
}

// ── 5. Empty message ──────────────────────────────────────────────────────────
console.log("\n5. Empty message");
for (const msg of ["", "   "]) {
  const intent = detectNurablaIntent(msg);
  assertTrue(`empty (${JSON.stringify(msg)}) → no intent`, !intent.location && !intent.menu);
  assertEqual(`empty (${JSON.stringify(msg)}) → fallback reply`, buildNurablaReply(msg), NURABLA_FALLBACK);
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log("");
if (failures > 0) {
  console.error(`FAILED — ${failures} assertion(s) failed`);
  process.exit(1);
} else {
  console.log("ALL PASSED");
  process.exit(0);
}
