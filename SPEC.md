# SPEC: Test Harness Alignment — RandevuFlow Turkish Schema

**Status:** Awaiting approval  
**Scope:** `scripts/` test files only — production code (`lib/`, `app/`) is untouched  
**Goal:** Make all four test scripts consistent with the current Turkish schema and stage machine

---

## 1. Objective

The RandevuFlow codebase was migrated from a US plumbing schema to a Turkish laser/aesthetic appointment schema. Production code in `lib/` is fully migrated. Three of the four test scripts in `scripts/` are already aligned. One script (`test-reset-endpoint.ts`) retains two stale stage values and two incorrect post-reset assertions that will cause TypeScript errors and runtime test failures.

This spec governs the safe, surgical correction of those four lines — and only those four lines.

---

## 2. Audit Results

### 2.1 Source of Truth — Production Schema

**ConversationState fields** (`lib/conversationState.ts`):

| Field | Type | Notes |
|---|---|---|
| `name` | `string?` | Customer's name |
| `phone` | `string?` | Normalized Turkish mobile |
| `service` | `string?` | e.g. "lazer epilasyon" |
| `treatmentArea` | `string?` | e.g. "tüm vücut", "bacak" |
| `firstTimeLaser` | `boolean?` | First-time vs. returning |
| `priceInquired` | `boolean?` | Price/package inquiry signal |
| `preferredDate` | `string?` | e.g. "cumartesi" |
| `preferredTime` | `string?` | e.g. "öğleden sonra", "14:00" |
| `location` | `string?` | Istanbul district or city |
| `urgency` | `"low" \| "medium" \| "high"?` | |
| `source` | `string?` | "sms" or "whatsapp" |
| `notes` | `string?` | Free-form notes |
| `leadScore` | `"hot" \| "warm" \| "cold"?` | |
| `stage` | `Stage` | Required — see below |
| `history` | `Array<{role, content}>` | Last 10 turns |
| `lastUpdated` | `number` | Unix ms timestamp |
| `ownerAlertedHighUrgency` | `boolean?` | Deduplication flag |
| `ownerAlertedComplete` | `boolean?` | Deduplication flag |
| `sheetLoggedComplete` | `boolean?` | Deduplication flag |

**Fields that no longer exist (removed during migration):**

- `issue_type` (old plumbing field)
- `fixture` (old plumbing field)
- `address` (old plumbing field)
- `collect_address` (old stage name)
- `collect_service` (old stage name)
- `preferred_time` (old snake_case field — replaced by `preferredTime`)

### 2.2 Stage Machine

**Type definition** (`lib/conversationState.ts`, line 3–8):

```typescript
export type Stage =
  | "collect_treatment_area"   // initial / fresh state
  | "collect_first_time"
  | "collect_datetime"
  | "collect_name"
  | "complete";
```

**`getNextStage()` logic** (lines 160–166):

```
!treatmentArea && !service     → "collect_treatment_area"
firstTimeLaser === undefined   → "collect_first_time"
!preferredDate && !preferredTime → "collect_datetime"
!name                          → "collect_name"
else                           → "complete"
```

**`freshState()` initial stage:** `"collect_treatment_area"` (line 42)

> **Important discrepancy with the brief:** The brief stated the flow as  
> `collect_name → collect_service → collect_datetime → complete`.  
> This does not match the code. The correct live flow is:  
> `collect_treatment_area → collect_first_time → collect_datetime → collect_name → complete`  
> The brief appears to describe a transitional or outdated snapshot.

### 2.3 Test File Audit

| Script | Status | Issues |
|---|---|---|
| `scripts/test-sms.ts` | ✅ Aligned | None — stages, fields, and assertions all correct |
| `scripts/test-inbound-endpoint.ts` | ✅ Aligned | None — uses all Turkish stage names and fields |
| `scripts/test-whatsapp-webhook.ts` | ✅ Aligned | None — 4-turn and 6-turn flows use correct schema |
| `scripts/test-reset-endpoint.ts` | ❌ **Has bugs** | See §2.4 |

### 2.4 Bugs in `test-reset-endpoint.ts`

**Bug 1 — Stale stage value (×2)**

Lines 154 and 176 call `updateState()` with `stage: "collect_service"`. This stage does not exist in the `Stage` type. TypeScript will reject it at compile time (`npm run type-check`).

```typescript
// Line 154 (Section 3) — current (WRONG):
await updateState(PHONE_TEST, { name: "Test User", stage: "collect_service" });

// Line 176 (Section 4) — current (WRONG):
await updateState(PHONE_PLUS_TEST, { name: "Test User 2", stage: "collect_service" });
```

**Correct replacement:** `"collect_treatment_area"` (the semantically appropriate "non-initial" stage to write before testing that a reset clears it; any valid stage would work, but `collect_treatment_area` is the most neutral choice and matches the fresh-state default).

---

**Bug 2 — Wrong post-reset assertion (×2)**

Lines 168 and 190 assert that the stage after a reset is `"collect_name"`. After `deleteConversationState()`, `getState()` returns `freshState()` whose initial `stage` is `"collect_treatment_area"`, not `"collect_name"`.

```typescript
// Line 168 (Section 3) — current (WRONG):
assertEqual("stage after reset = collect_name", stateAfterReset.stage, "collect_name");

// Line 190 (Section 4) — current (WRONG):
assertEqual("stage after reset = collect_name", stateAfterReset2.stage, "collect_name");
```

**Correct replacement:** Assert `"collect_treatment_area"`. Update the label string to match.

---

## 3. Change Plan

All changes are in `scripts/test-reset-endpoint.ts` only. Four lines total.

### Change A — Lines 154 and 176

Replace `"collect_service"` with `"collect_treatment_area"` in both `updateState` calls.

```diff
- await updateState(PHONE_TEST, { name: "Test User", stage: "collect_service" });
+ await updateState(PHONE_TEST, { name: "Test User", stage: "collect_treatment_area" });

- await updateState(PHONE_PLUS_TEST, { name: "Test User 2", stage: "collect_service" });
+ await updateState(PHONE_PLUS_TEST, { name: "Test User 2", stage: "collect_treatment_area" });
```

### Change B — Lines 168 and 190

Replace `"collect_name"` assertion and label with `"collect_treatment_area"`.

```diff
- assertEqual("stage after reset = collect_name", stateAfterReset.stage, "collect_name");
+ assertEqual("stage after reset = collect_treatment_area", stateAfterReset.stage, "collect_treatment_area");

- assertEqual("stage after reset = collect_name", stateAfterReset2.stage, "collect_name");
+ assertEqual("stage after reset = collect_treatment_area", stateAfterReset2.stage, "collect_treatment_area");
```

---

## 4. Acceptance Criteria

1. `npm run type-check` exits 0 (no TypeScript errors).
2. `npm run test-reset` exits 0 with all tests passing (in memory mode — no Redis required).
3. `npm run test-sms`, `npm run test-inbound`, and `npm run test-whatsapp` still exit 0 (no regression).
4. No changes to any file outside `scripts/test-reset-endpoint.ts`.
5. No changes to production code (`lib/`, `app/`).

---

## 5. Out of Scope

- Modifying `lib/conversationState.ts`, `lib/slotExtractor.ts`, `lib/inboundPipeline.ts`, or any other production file.
- Adding new test cases or test scripts.
- Changing the `Stage` type or `getNextStage()` logic.
- Modifying `test-sms.ts`, `test-inbound-endpoint.ts`, or `test-whatsapp-webhook.ts` — these are already correct.

---

## 6. Boundaries

| | Rule |
|---|---|
| **Always** | Edit exactly the four identified lines; run type-check before reporting done |
| **Ask first** | Any change beyond the four specified lines; any production code touch |
| **Never** | Modify `lib/`, `app/`, `next.config.ts`, or any non-test file |

---

## 7. Open Questions / Ambiguities

1. **Flow described in brief vs. code:** The brief states `collect_name → collect_service → collect_datetime → complete`. The actual stage machine has neither `collect_service` nor that ordering. Please confirm the authoritative flow is what's in code: `collect_treatment_area → collect_first_time → collect_datetime → collect_name → complete`. If the intent is to change the stage machine itself, that is a separate spec.

2. **`test-reset-endpoint.ts` Section 5 (line 197):** Uses `stage: "collect_datetime"` which IS a valid stage. This line is correct and not in scope.

3. **`collect_service` in `updateState`:** TypeScript's structural typing means passing an invalid `stage` string currently compiles only if the Stage type uses `string` as a base. Since `Stage` is a union of string literals, `"collect_service"` will cause a compile error. If `npm run type-check` is not currently run in CI, this bug is silent. The spec recommends adding `type-check` to any CI pipeline.
