# Glyph rules (worker one-pager)

You are editing a **Glyph-encoded** view of the source. Human names are in `LEGEND.md`.

1. Read `LEGEND.md` before editing. Identifiers look like `g7a`, `g2b` (type key + serial).
2. Edit only owned paths listed in the task packet.
3. Keep Glyph names when calling locals/functions in those files; do not invent new human identifiers.
4. Do not modify `LEGEND.md` or `.glyph/` unless the operator says so.
5. Language keywords, types like `string`/`number`, and builtins (`String`, `console`, …) stay as-is.
6. Acceptance tests run **after** the harness decodes your edits back to human names. If you run tests yourself on Glyph form, import mismatches are expected.

Type key reminder: `0` nullish · `1` int · `2` str · `3` float · `4` bool · `5` object · `6` array · `7` function · `8` class/type · `9` unknown.
