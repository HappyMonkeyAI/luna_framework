# Luna Framework

Bounded autonomy / model-routing evaluation framework for real engineering work.

Use the least expensive adequate model for a tightly scoped slice, keep shared architecture legible, and accept results only on independent evidence — not worker self-report.

**Copyright © 2026 Stephen Phillips and [HappyMonkeyAI](https://github.com/HappyMonkeyAI).** Released under the [MIT License](LICENSE).

## What this is

Luna Framework is a documentation-first evaluation and execution discipline for coding agents:

- Decompose larger objectives into owned, verifiable task packets
- Gather repository context before editing
- Route cheaper models (e.g. Luna) to narrow slices; escalate (e.g. Terra / break-glass) only on evidence
- Verify with real commands; separate worker claims from owner acceptance
- Retain durable lessons without copying secrets or noisy logs

It is **not** a claim that one model beats another. Early matched runs are exploratory protocol evidence unless a registered protocol says otherwise.

## Start here

| Doc | Role |
|---|---|
| [`BRIEF.md`](BRIEF.md) | Origin, design thesis, objectives |
| [`SPINE.md`](SPINE.md) | End-to-end workflow and component map |
| [`GLOSSARY.md`](GLOSSARY.md) | Shared vocabulary and routing hypothesis |
| [`TASK-TEMPLATE.md`](TASK-TEMPLATE.md) | Bounded task packet template |
| [`EVALUATION-PROTOCOL.md`](EVALUATION-PROTOCOL.md) | Rules for comparable evaluations |
| [`REPOSITORY-INTELLIGENCE.md`](REPOSITORY-INTELLIGENCE.md) | Provider-neutral context-layer contract |
| [`RESULTS.md`](RESULTS.md) | Evaluation registry (exploratory / matched / incomplete) |
| [`LINKS.md`](LINKS.md) | Related projects and protocols |
| [`PROGRESS.md`](PROGRESS.md) | Current state and limitations |

## Code in this repo

| Path | Role |
|---|---|
| `scripts/repo_context.py` | Native repository-context reference implementation |
| `scripts/test_repo_context.py` | Adversarial contract tests for that implementation |
| `scripts/run_matched_evaluation.sh` | Matched-evaluation launcher harness |
| `rubrics/` | Scoring rubrics used in controlled confirmation tracks |
| `b4-repeat-track/` | Frozen B4 confirmation evidence + SHA-256 manifest |

## Evaluation fixtures

Canonical TypeScript fixtures used for B1–B4 live under `fixtures/` as **local nested git repositories** (with their own tags/baselines). They are **not published in this GitHub snapshot** — `fixtures/` is gitignored because it includes nested `.git` history, `node_modules`, and large disposable worktrees under `fixtures/fixture-runs/`.

What *is* tracked for differential oracles:

- `fixtures/diff-tests/` — parent-side A1–A4 differential / trace harnesses

To reproduce matched runs you need the fixture repos locally (same baseline tags recorded in `RESULTS.md`). Publishing those fixtures as standalone public repos is optional follow-up work.

## Sister lab: Glyph

[`labs/glyph/`](labs/glyph/) — **agent-facing code encoding** (typed short identifiers + legend), not model routing. Track A matched protocol is registered; no runs yet. Start at [`labs/glyph/BRIEF.md`](labs/glyph/BRIEF.md).

## Related HappyMonkeyAI work

- [AgentsProtocol](https://github.com/HappyMonkeyAI/AgentsProtocol) — agent operating protocol used alongside this discipline
- [Echoes of Aion](https://github.com/SPhillips1337/EchoesOfAion) — mature-project operational pilot target (separate repo)

## Claim boundaries

Do **not** read this repo as:

- Luna vs Terra superiority
- Statistically valid model ranking from small samples
- A production product or turnkey agent harness
- Permission to commit, push, deploy, or change ownership outside an explicit task packet

## License

[MIT](LICENSE) — Copyright (c) 2026 Stephen Phillips and HappyMonkeyAI.
