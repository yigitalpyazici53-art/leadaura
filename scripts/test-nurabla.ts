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
  detectNurablaBranch,
  detectNurablaIntent,
  NURABLA,
  NURABLA_BRANCH_PROMPT,
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

const CEKMEKOY = NURABLA.branches.cekmekoy;
const UMRANIYE = NURABLA.branches.umraniye;
const BASAKSEHIR = NURABLA.branches.basaksehir;

// ── 1. Location question (intent detection) ───────────────────────────────────
console.log("\n1. Location question");
for (const msg of ["konum", "Adres", "nerede", "Nasıl gelirim?", "yol tarifi", "harita"]) {
  const intent = detectNurablaIntent(msg);
  assertTrue(`"${msg}" → location intent`, intent.location && !intent.menu);
}

// ── 2. Menu question ──────────────────────────────────────────────────────────
console.log("\n2. Menu question");
for (const msg of ["menü", "menu", "MENÜ", "fiyat", "yemekler", "ne var", "kahvaltı"]) {
  const intent = detectNurablaIntent(msg);
  assertTrue(`"${msg}" → menu intent`, intent.menu && !intent.location);
}
{
  const reply = buildNurablaReply("menü");
  assertTrue("menu-only reply contains menu link", reply.includes(NURABLA.menuUrl));
  assertTrue("menu-only reply omits any branch maps link", !reply.includes(CEKMEKOY.mapsUrl));
  assertTrue("menu-only reply is not the branch prompt", !reply.includes(NURABLA_BRANCH_PROMPT));
}

// ── 3. Location with a specific branch ────────────────────────────────────────
console.log("\n3. Location with a specific branch");
for (const [label, variants, branch] of [
  ["Çekmeköy", ["Çekmeköy konum", "cekmekoy konum"], CEKMEKOY],
  ["Ümraniye", ["Ümraniye konum", "umraniye konum"], UMRANIYE],
  ["Başakşehir", ["Başakşehir konum", "basaksehir konum"], BASAKSEHIR],
] as const) {
  for (const msg of variants) {
    const reply = buildNurablaReply(msg);
    assertTrue(`"${msg}" → ${label} address`, reply.includes(branch.address));
    assertTrue(`"${msg}" → ${label} maps link`, reply.includes(branch.mapsUrl));
    assertTrue(`"${msg}" → not the branch prompt`, !reply.includes(NURABLA_BRANCH_PROMPT));
  }
  // Branch is not mistaken for a different branch's maps link.
  const reply = buildNurablaReply(`${label} konum`);
  const otherLinks = [CEKMEKOY, UMRANIYE, BASAKSEHIR]
    .filter((b) => b !== branch)
    .map((b) => b.mapsUrl);
  assertTrue(`"${label} konum" → no other branch's link`, otherLinks.every((l) => !reply.includes(l)));
}

// ── 4. Location without a branch → branch-selection prompt ─────────────────────
console.log("\n4. Location without a branch");
for (const msg of ["konum", "adres nedir", "nerede", "yol tarifi"]) {
  assertEqual(`"${msg}" → branch prompt`, buildNurablaReply(msg), NURABLA_BRANCH_PROMPT);
}
assertEqual(
  "branch prompt exact text",
  NURABLA_BRANCH_PROMPT,
  "Hangi şubemizin konumunu paylaşmamızı istersiniz?\n\n1. Çekmeköy\n2. Ümraniye\n3. Başakşehir"
);

// ── 5. Menu only returns the menu link directly ───────────────────────────────
console.log("\n5. Menu only");
{
  const reply = buildNurablaReply("menü fiyat");
  assertEqual("menu-only reply", reply, `Menümüz: ${NURABLA.menuUrl}`);
}

// ── 6. Menu + location without a branch ───────────────────────────────────────
console.log("\n6. Menu + location without a branch");
{
  const reply = buildNurablaReply("menü ve konum lütfen");
  assertTrue("contains menu link", reply.includes(NURABLA.menuUrl));
  assertTrue("then asks which branch", reply.includes(NURABLA_BRANCH_PROMPT));
}

// ── 7. Menu + location with a branch ──────────────────────────────────────────
console.log("\n7. Menu + location with a branch");
{
  const reply = buildNurablaReply("Ümraniye menü ve konum");
  assertTrue("contains menu link", reply.includes(NURABLA.menuUrl));
  assertTrue("contains Ümraniye maps link", reply.includes(UMRANIYE.mapsUrl));
  assertTrue("does not ask which branch", !reply.includes(NURABLA_BRANCH_PROMPT));
}

// ── 8. Branch detection is null without a branch mention ──────────────────────
console.log("\n8. Branch detection");
assertEqual('"konum" → no branch', detectNurablaBranch("konum"), null);
assertEqual('"cekmekoy" → cekmekoy', detectNurablaBranch("cekmekoy"), "cekmekoy");

// ── 9. Unsupported question ───────────────────────────────────────────────────
console.log("\n9. Unsupported question");
for (const msg of ["rezervasyon yapmak istiyorum", "teşekkürler", "iş başvurusu"]) {
  const intent = detectNurablaIntent(msg);
  assertTrue(`"${msg}" → no intent`, !intent.location && !intent.menu);
  assertEqual(`"${msg}" → fallback reply`, buildNurablaReply(msg), NURABLA_FALLBACK);
}

// ── 10. Empty message ─────────────────────────────────────────────────────────
console.log("\n10. Empty message");
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
