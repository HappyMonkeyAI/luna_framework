# G-A0 Raw — B1 single-file regression (control arm)

## Protocol

- Glyph lab Track A matched evaluation G-A0
- Arm: **Raw** (human identifiers; no Glyph encode)
- Route: same small-model route as Glyph arm (explicit capture required)
- Baseline: `benchmark-b1-stab` → `a92eb1dd18b158b8c2670ac70f68dcca08faec00`

## Objective

Fix the email normalization regression so the existing public function returns a trimmed, lowercase email address.

## Owned path

- `src/domain/email.ts`

## Required reading

- `README.md`
- `docs/SPINE.md`
- `docs/GLOSSARY.md`
- `src/domain/email.ts`
- `tests/email.test.ts`

## Forbidden scope

Do not modify tests, package files, documentation, B2/B3 files, or unrelated paths. Do not add dependencies. Do not commit, push, merge, reset, stash, clean, or delete unless the benchmark operator explicitly authorizes it.

## Acceptance criteria

1. `normalizeEmail('  Alice@Example.COM ')` returns `alice@example.com`.
2. The focused B1 test passes.
3. The fixture typecheck passes.
4. Only the owned implementation file changes.
5. The input string remains immutable.

## Verification

From the fixture repository root:

- `pnpm run test:b1`
- `pnpm run typecheck`
- `git diff --check`

## Handoff

Record model/provider, session ID, attempts, repairs, changed paths, scope drift, commands/results, initial failures, and remaining blockers.
