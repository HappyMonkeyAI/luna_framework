# Glyph Lab Brief

Sister investigation to Luna Framework: **agent-facing code encoding**, not model routing.

Working name: **Glyph**. Human-readable source remains source of truth. Glyph transforms what a coding worker *sees* (and optionally edits), then maps results back.

## Origin

Prompted by neural text-compression research (e.g. Tufa Labs’ tufazip) and an owner hypothesis: AI workers need not inherit human naming conventions. Typed short identifiers, structural folding of repetition, and lazy hydration might free context for smaller models — if, and only if, the model can still reason with a legend / adapter.

## Design thesis

1. English identifiers (`normalizeUserEmail`, `strUserInput`) optimize for humans and for pretraining corpora.
2. For agents under a token budget, a reversible **machine-facing IR** may be cheaper: typed positional codes, shared legends, and factored repeated structure.
3. Pretraining gravity means opaque encodings will likely *hurt* without an explicit key, few-shot schema, or adapter (e.g. LoRA). The legend is part of the experiment, not an afterthought.
4. Exotic storage (video frames, neural zip as primary code medium) is out of scope until a boring codec shows a verified win.

## Relationship to Luna

| Luna | Glyph |
|---|---|
| Which model / how bounded | What encoding the worker reads |
| Task packets + owner acceptance | Codec + decode round-trip + same acceptance |
| Cost-per-diff via routing | Cost-per-diff via representation |

Glyph reuses Luna’s evidence culture (`EVALUATION-PROTOCOL.md` controls: common baseline, isolated worktrees, identical packet, independent verification). It does **not** reopen Luna model-superiority claims.

## Tracks (priority order)

| Track | Question | Status |
|---|---|---|
| **A — Naming codec** | Does typed short-ID rename + legend help a small model on a Luna-style packet? | First protocol — see `EVALUATION-PROTOCOL.md` |
| **B — Structural fold** | Does extracting repeated AST / control-flow patterns into one referenced form help? | Deferred until A has n≥1 matched evidence |
| **C — Lazy hydrate** | Does signature-skeleton + on-demand body fetch beat full-file dumps? | Deferred; overlaps existing condensers — only run if A/B leave a gap |

## Claim boundaries

**May claim (only with matched evidence):** for a stated codec + legend + model class + task class, worker context tokens and/or verified success rate moved in a recorded direction under Luna controls.

**Must not claim from Track A alone:**

- Production readiness of a public product
- That hex/typed names are universally better than English
- Luna vs Terra (or any model) superiority
- That LoRA / video / neural zip is required or proven
- That “compression ratio” alone equals engineering quality

## Success definition (lab)

A win for Track A is **not** maximum character compression. It is:

1. Round-trip fidelity: decode(encode(source)) preserves behavior for the fixture tests.
2. Worker edits land correctly after decode (owned paths, acceptance tests pass under independent verification).
3. Under a fixed small-model route, either verified success holds at lower prompt-token cost, or success rate improves at equal budget — recorded as exploratory until n>1.

## Non-goals (v0)

- Replacing TypeScript/Python as the stored language of record
- Shipping a new programming language
- Training a foundation model
- Video-as-memory or neural archive backends
- Changing Luna’s closed B4 confirmation ledger

## Core artifacts

- `labs/glyph/BRIEF.md` — this document
- `labs/glyph/EVALUATION-PROTOCOL.md` — Track A matched protocol
- `labs/glyph/GLOSSARY.md` — codec vocabulary and type-key sketch
- `labs/glyph/LINKS.md` — discovery landscape (steal / avoid / cite)
- Parent: Luna `BRIEF.md`, `EVALUATION-PROTOCOL.md`, `RESULTS.md` for shared discipline

## Next decision

G-A0 exploratory pair complete (`qwen-code:qwen3.8-max`, Raw→Glyph): both passed independent verify; Glyph W1 decode preserved the fix. See `RESULTS.md`. **Next (optional):** n>1 / randomized order, or Codex Luna-class retry when quota allows.

### Harness quickref

```text
python labs/glyph/w1_harness.py encode --root <worktree> --path src/domain/email.ts
# worker edits Glyph sources using LEGEND.md + GLYPH-RULES.md
python labs/glyph/w1_harness.py decode --root <worktree>
# then run fixture tests / typecheck on decoded human source
```
