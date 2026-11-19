# Glyph Lab Results Registry

## Status legend

- **Exploratory** — useful for hypothesis formation; not a superiority claim.
- **Matched** — Track A controls satisfied for the listed arms.
- **Incomplete** — insufficient evidence.

## Registered protocols

| ID | Track | Protocol | Status | Notes |
|---|---|---|---|---|
| G-A0 | A — Naming codec | `EVALUATION-PROTOCOL.md` (W1, codec v0) | Harness ready; **no worker runs yet** | Codec + W1 CLI frozen under `labs/glyph/`; B1 smoke encode on `fixtures/routing-benchmark-ts/src/domain/email.ts` → `g7a`/`g2b` |

## Tooling evidence (not a model comparison)

| Check | Result |
|---|---|
| `python labs/glyph/test_codec.py` | 10/10 pass |
| `python labs/glyph/test_w1_harness.py` | 1/1 pass |
| Smoke encode/reset on B1 `email.ts` | Round-trip OK; legend maps `g7a→normalizeEmail`, `g2b→value` |

## Worker runs

_None yet._ Next: matched Raw vs Glyph pair on baseline `benchmark-b1-baseline` / commit recorded in fixture task packet, same small-model route, independent verification after `w1_harness.py decode`.
