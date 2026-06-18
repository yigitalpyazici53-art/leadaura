# Plan: Fix Stale Stage References in test-reset-endpoint.ts

## Context

`scripts/test-reset-endpoint.ts` contains two stale stage values (`"collect_service"`)
and two wrong post-reset assertions (`"collect_name"`) left over from the plumbing-era schema.
The live Stage type and `freshState()` initial value are defined in `lib/conversationState.ts`.

**Authoritative stage machine:**
`collect_treatment_area → collect_first_time → collect_datetime → collect_name → complete`

**`freshState()` initial stage:** `"collect_treatment_area"`

---

## Dependency Graph

```
lib/conversationState.ts   ← source of truth (Stage type, freshState)
        │
        └─► scripts/test-reset-endpoint.ts   ← only file being changed
```

---

## Task 1 — Change A: Fix stale `stage` values (lines 154 and 176)

Replace `"collect_service"` with `"collect_treatment_area"` in both `updateState()` calls.

```diff
- await updateState(PHONE_TEST, { name: "Test User", stage: "collect_service" });
+ await updateState(PHONE_TEST, { name: "Test User", stage: "collect_treatment_area" });

- await updateState(PHONE_PLUS_TEST, { name: "Test User 2", stage: "collect_service" });
+ await updateState(PHONE_PLUS_TEST, { name: "Test User 2", stage: "collect_treatment_area" });
```

**Checkpoint A:** `npm run type-check` exits 0.

---

## Task 2 — Change B: Fix wrong post-reset assertions (lines 168 and 190)

Replace `"collect_name"` with `"collect_treatment_area"` in both `assertEqual` calls
(update both the label string and the expected value).

```diff
- assertEqual("stage after reset = collect_name", stateAfterReset.stage, "collect_name");
+ assertEqual("stage after reset = collect_treatment_area", stateAfterReset.stage, "collect_treatment_area");

- assertEqual("stage after reset = collect_name", stateAfterReset2.stage, "collect_name");
+ assertEqual("stage after reset = collect_treatment_area", stateAfterReset2.stage, "collect_treatment_area");
```

**Checkpoint B:** `npm run test-reset` exits 0.

---

## Checkpoint B — Full Regression Suite

```bash
npm run type-check      # must pass
npm run test-reset      # primary target
npm run test-sms        # regression
npm run test-inbound    # regression
npm run test-whatsapp   # regression
```

---

## Boundaries

| Rule | Detail |
|---|---|
| Files changed | `scripts/test-reset-endpoint.ts` only |
| Lines changed | 154, 168, 176, 190 |
| Production code | Untouched (`lib/`, `app/`) |
| New tests | None |
| New abstractions | None |
