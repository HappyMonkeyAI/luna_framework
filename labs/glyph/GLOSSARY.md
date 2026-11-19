# Glyph Glossary

| Term | Meaning |
|---|---|
| **Glyph** | This lab: reversible agent-facing encoding of program text. |
| **Codec** | Encode/decode pair between human source and Glyph form. |
| **Legend** | Table mapping Glyph ids → human names, kinds, and anchors. |
| **Type key** | Leading digit on a Glyph id indicating inferred/declared kind (`0`–`9` in v0). |
| **Serial** | Stable short suffix (`a`, `b`, … or numeric) unique within the encode unit. |
| **Writeback** | How worker edits return to human SoT (`W1` edit-encoded-then-decode; `W2` mapped edits). |
| **Round-trip** | `decode(encode(source))` preserves semantics except intentional task edits. |
| **Track A** | Naming-codec experiments only. |
| **Track B** | Structural folding of repeated AST/control-flow (deferred). |
| **Track C** | Skeleton + lazy hydrate (deferred). |
| **SoT** | Source of truth — human-readable repository files under normal tooling. |

## v0 type key (reminder)

`0` nullish · `1` int · `2` str · `3` float · `4` bool · `5` object · `6` array · `7` function · `8` class/type · `9` unknown
