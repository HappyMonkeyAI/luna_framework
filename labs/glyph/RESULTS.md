# Glyph Lab Results Registry

## Status legend

- **Exploratory** — useful for hypothesis formation; not a superiority claim.
- **Matched** — Track A controls satisfied for the listed arms.
- **Incomplete** — insufficient evidence.

## Registered protocols

| ID | Track | Protocol | Status | Notes |
|---|---|---|---|---|
| G-A0 | A — Naming codec | `EVALUATION-PROTOCOL.md` (W1, codec v0) | **Exploratory** (n=1 pair) | Both arms passed independent verify on `qwen-code:qwen3.8-max` |

## Tooling evidence (not a model comparison)

| Check | Result |
|---|---|
| `python labs/glyph/test_codec.py` | 10/10 pass |
| `python labs/glyph/test_w1_harness.py` | 1/1 pass |
| Smoke encode/reset on B1 `email.ts` | Round-trip OK; `g7a→normalizeEmail`, `g2b→value` |

## G-A0 matched pair (2026-11-19)

| Item | Value |
|---|---|
| Fixture | `fixtures/routing-benchmark-ts` |
| Baseline tag | `benchmark-b1-stab` |
| Baseline commit | `a92eb1dd18b158b8c2670ac70f68dcca08faec00` |
| Raw worktree | `fixtures/fixture-runs/g-a0-raw` |
| Glyph worktree | `fixtures/fixture-runs/g-a0-glyph` |
| Packets | `labs/glyph/packets/G-A0-raw-b1.md`, `labs/glyph/packets/G-A0-glyph-b1.md` |
| Provider/model | `qwen-code` / `qwen3.8-max` (same both arms) |
| Approval | `--approval-mode yolo` |
| Dispatch order | Raw → Glyph |
| Codex attempt | Incomplete earlier (usage limit); superseded by qwen route |

### Outcomes (independent parent verification)

| Arm | Session | Elapsed (dispatch) | Last total_tokens (envelope) | Owned diff | `test:b1` | `typecheck` | `git diff --check` | Outcome |
|---|---|---|---|---|---|---|---|---|
| Raw | `c8ada1e3-9732-43ac-a82d-e42a5eac5592` | 300s | 23279 | `email.ts` only (+`.toLowerCase()`) | 0 | 0 | 0 | **Passed** |
| Glyph | `e3786876-a662-4552-ba16-39b09f819662` | 445s | 26367 | Worker edited Glyph `g7a`/`g2b`; W1 decode → same human diff | 0 (after decode) | 0 | 0 | **Passed** |

Glyph worker post-edit form before decode:

```ts
export function g7a(g2b: string): string {
    return g2b.trim().toLowerCase();
}
```

### Scope notes

- Tracked source change on both arms: only `src/domain/email.ts`.
- Glyph arm also had harness-owned untracked artifacts (`LEGEND.md`, `.glyph/`, `GLYPH-RULES.md`, packet copy) — not worker scope drift.
- Both worktrees grew incidental `?? .ijfw/` from the worker environment; not part of acceptance.

### Honest limits

- **Exploratory**, n=1, single dispatch order (Raw→Glyph).
- Route is **not** the originally intended `openai-codex:gpt-5.6-luna`; Codex was quota-blocked.
- Elapsed/token columns are raw envelopes (warm-cache possible); **not** a speed/cost ranking.
- Does **not** prove typed Glyph names help or hurt versus raw — only that this small-model-class worker can complete B1 in both presentations under W1.
- Does not reopen frozen Luna B4 claims.

### Artifacts

- `labs/glyph/runs/g-a0-raw-qwen.{json,err,meta}`
- `labs/glyph/runs/g-a0-glyph-qwen.{json,err,meta}`
- Prompts: `labs/glyph/runs/g-a0-*-prompt.txt`

## Next

Optional: n>1 with randomized order; frequency-gated rename; or retry intended Luna-class Codex route when quota allows. Track B/C still deferred.
