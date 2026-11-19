# Glyph Track A — Matched Evaluation Protocol

## Purpose

Test whether a **typed short-identifier codec + legend** improves small-model bounded engineering work relative to raw human-named source, under Luna evidence controls.

Status for first runs: **Exploratory** until n>1 cells exist with normalized capture.

## Hypothesis (A0)

On a single-file, contract-clear task, presenting the worker with Glyph-renamed identifiers plus an explicit legend will not reduce independently verified success rate versus raw source, and will reduce prompt tokens attributable to identifier spelling.

Falsifiers: verified failure on Glyph arm while raw arm passes (same packet/model); or token savings that vanish once the legend is counted; or decode/round-trip breakage.

## Required controls (inherit Luna)

1. **Common starting point** — same fixture commit/tag for both arms.
2. **Isolated matching worktrees** — one raw arm, one Glyph arm; no cross-contamination.
3. **Identical engineering task** — same objective, owned paths, acceptance tests, verification commands. Only the *presentation encoding* differs.
4. **Explicit route capture** — same small-model route for both arms; record provider, model, thread/run id.
5. **Independent verification** — owner reruns tests/typecheck on **decoded** human source (or verifies codec applied only inside the worker view and writeback round-trips). Worker self-report is not acceptance.
6. **Scope checks** — owned paths only; no silent dependency or config edits unless listed.

## Arms

| Arm | Worker sees | Acceptance measured on |
|---|---|---|
| **Raw** | Unmodified fixture source | Fixture tests as today |
| **Glyph** | Encoded identifiers + legend file (required reading) | Same tests after decode to human source, or on a worktree that never permanently stores Glyph form |

Both arms must use the **same** task packet text for the engineering objective. Glyph arm adds only: “Identifiers are Glyph-encoded; use `LEGEND.md`; emit edits in Glyph form” (or “edit decoded paths via tool X”) — pick one writeback mode and freeze it before dispatch.

### Writeback modes (choose one per protocol registration)

- **W1 — Edit encoded, decode on accept:** worker patches Glyph files; harness decodes before tests.
- **W2 — Read encoded, edit via mapped paths:** worker reads Glyph view; harness maps symbol edits back to human names before write.

First registration: prefer **W1** (simpler to instrument).

## Codec v0 (naming only)

Scope: rename user-defined functions, methods, properties, and locals that are safe under the fixture’s parser. Do **not** rename language keywords, imported public APIs from node builtins, or test-framework globals unless the legend explicitly covers them.

### Type key (column 0 of each Glyph id)

| Code | Meaning |
|---|---|
| `0` | null / void / undefined-ish binding |
| `1` | int / integer-like |
| `2` | str / string-like |
| `3` | float / number (non-int) |
| `4` | bool |
| `5` | object / record |
| `6` | array / list |
| `7` | function / callable |
| `8` | class / type constructor |
| `9` | unknown / uninferred |

### Identifier shape

`g{type}{serial}` e.g. `g2a`, `g7b` — short, ASCII, collision-free within the file/module under a stable serial assignment.

Legend format (machine + human):

```text
g7a  normalizeEmail  function  src/domain/email.ts
g2b  rawInput        string    parameter of g7a
```

Serial assignment must be deterministic from sorted source order so both worktrees encode identically from the same commit.

## Fixture recommendation

Reuse Luna **B1-class** routing fixture behavior (single-file email normalization or equivalent): one owned path, deterministic tests, low blast radius. Record exact fixture path + baseline commit in the run ledger when registered.

## Packet differences allowed

| Field | Raw arm | Glyph arm |
|---|---|---|
| Objective / acceptance / owned paths | identical | identical |
| Required reading | fixture docs as usual | + `LEGEND.md` + one-page Glyph rules |
| Source files in context | human names | Glyph names |

## Metrics

| Metric | Definition |
|---|---|
| Outcome | Passed / failed / blocked / incomplete (independent verification) |
| Prompt tokens | Input tokens for the implementation turn (legend counted on Glyph arm) |
| Identifier-char estimate | Optional: sum of identifier token lengths pre/post encode (harness-side, not model claim) |
| Attempts / repairs | Same as Luna |
| Scope drift | Unauthorized paths |
| Round-trip | Harness decode equals baseline except intentional task edits |
| Route | Explicit small-model id |

Do **not** rank arms on wall-clock until launcher/cache discipline matches Luna stabilized runs.

## Procedure

1. Freeze codec v0 + legend generator + W1 decode harness; commit under `labs/glyph/` or fixture tooling.
2. Pick fixture baseline commit; verify failing/incomplete objective.
3. Build two worktrees from that commit.
4. On Glyph worktree only: run encode → write Glyph sources + `LEGEND.md`; keep a decode map artifact outside worker-owned paths if needed.
5. Dispatch identical engineering packets (presentation notes differ as above) on the same small-model route.
6. Independently verify; for Glyph, decode then test (W1).
7. Record both arms in `labs/glyph/RESULTS.md` with status **Exploratory**.

## Comparison status labels

- **Exploratory** — default for n=1.
- **Matched** — controls above satisfied; still not a superiority claim without n>1 and pre-registered aggregation rules.
- **Incomplete** — encode/decode failure, route uncertainty, or verification skipped.

## Explicitly deferred

Track B (structural fold), Track C (lazy hydrate), LoRA training, video/neural backends, multi-file codecs, cross-module renames that break external API surfaces.
