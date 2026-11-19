# Glyph — discovery links (steal / avoid / cite)

Bounded landscape note (2026-11-19). Not an adoption decision. Glyph Track A stays: typed short-ID rename + legend + W1 edit-in-Glyph, under Luna matched controls.

## Closest peers (Track A — naming / minification)

| Project | Link | What it does | Steal | Avoid / differentiate |
|---|---|---|---|---|
| Minified state-in-context agent | https://arxiv.org/html/2606.01326v1 · https://github.com/ipa-lab/minified-state-in-context-agent | Code minification for SWE agents; short identifiers **with** in-context lookup table; reverse names in patches | Frequency-gated rename (only rename when map overhead pays off); measure resolve-rate vs token savings together | They report ~42% fewer input tokens with ~−12pp resolve rate — treat as caution, not doom. Their write path prefers **human names in patches**; Glyph W1 tests **edit-in-Glyph then decode** |
| Aleph | https://github.com/alephnullai/Aleph | Content-addressed symbol IDs (`f_a3c9d2`) + dictionary; structural navigation + compression tiers | Typed **prefix** by kind (`f`/`t`/`v`/…); stable IDs across sessions | Hash suffixes ≠ Glyph’s typed positional serial + type key. Broader product surface than a Luna-style lab |
| Identifier replacement (code translation) | https://arxiv.org/abs/2510.09045 | Replace long IDs with placeholders for translation, restore after | Round-trip restore discipline; attention may shift toward structure when names shrink | Task is translation, not bounded engineering edit under owner verification |

## Skeleton / lazy hydrate (Track C — deferred)

| Project | Link | What it does | Steal later | Notes |
|---|---|---|---|---|
| context-condenser | https://github.com/david-spies/context-condenser | AST skeletons + `@LVM-ID`; hydrate on demand via MCP | Dependency-aware hydrate; signatures-first view | Overlaps Track C, not A |
| context-skeleton | https://github.com/msgtorahul-art/context-skeleton | Fold bodies; keep signatures/exports | Cheap structural fold for prompt dumps | Read-path only |
| astllm-mcp / jcodemunch-mcp | https://github.com/tluyben/astllm-mcp · https://github.com/jgravelle/jcodemunch-mcp | Index + fetch symbols by ID / byte offset | Precise retrieval beats dumping files | Repo-intelligence adjacent (Luna `REPOSITORY-INTELLIGENCE.md` family) |

## Hash / substrate / prompt zip (adjacent, not Track A)

| Project | Link | Relevance |
|---|---|---|
| OMC substrate-context | https://github.com/RandomCoder-lab/OMC/releases/tag/v0.4-substrate-context | Canonical hashes + library fetch; ~2–3× context budget in their workflow — **lookup compression**, not typed names |
| CodePromptZip | https://arxiv.org/html/2502.14925v2 | Type-aware prompt compression for RAG coding tasks; protects identifiers by priority |
| LongCodeZip | https://arxiv.org/abs/2510.00446 | Function/block selection under token budget for long code context |
| OpenContext compression doc | https://github.com/CesarMSFelipe/OpenContext-Runtime/blob/main/docs/token-efficiency/compression.md | Tiered terse/compact/efficient strategies; AST signatures without bodies |
| CGBridge | https://aclanthology.org/2026.findings-acl.434/ | Graph→soft-prefix bridge; robustness under renaming — trainable, not a codec lab |
| tufazip (mood / provenance) | https://tufalabs.ai/research/tufazip · https://x.com/tufalabs/status/2123350647273631907 | Neural lossless **text** compression (Wikipedia). Inspired the “compression as research” mood; **not** a code-IR design to copy |

## Luna / HappyMonkey anchors

| Resource | Link |
|---|---|
| Glyph brief / protocol | [`BRIEF.md`](BRIEF.md), [`EVALUATION-PROTOCOL.md`](EVALUATION-PROTOCOL.md) |
| Parent Luna links | [`../../LINKS.md`](../../LINKS.md) |
| AgentsProtocol | https://github.com/HappyMonkeyAI/AgentsProtocol |

## Glyph niche (keep claims tight)

After this sweep, Glyph’s testable wedge remains:

1. **Typed columnar keys** (`2`=str, `7`=fn, …) as an explicit hypothesis — not only shorter aliases or content hashes.
2. **W1 writeback** — worker edits Glyph form; harness decodes before acceptance (peers often minify for read and force human writeback).
3. **Luna matched evidence** — same packet/baseline/route/verification; token savings without verified success are incomplete.

## Maintenance

Add rows when a project is explicitly reviewed. Prefer public URLs. Mark steal vs avoid so future agents do not silently clone a peer’s writeback model.
