#!/usr/bin/env python3
"""Glyph codec v0 — typed short-identifier rename + legend + round-trip.

Human source remains SoT. Encode for worker view; decode before acceptance tests (W1).
Standard library only.
"""
from __future__ import annotations

import json
import re
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Iterable

CODEC_VERSION = 0

KEYWORDS = frozenset(
    {
        "abstract", "any", "as", "asserts", "async", "await", "boolean", "break",
        "case", "catch", "class", "const", "constructor", "continue", "debugger",
        "declare", "default", "delete", "do", "else", "enum", "export", "extends",
        "false", "finally", "for", "from", "function", "get", "if", "implements",
        "import", "in", "infer", "instanceof", "interface", "is", "keyof", "let",
        "module", "namespace", "never", "new", "null", "number", "object", "of",
        "package", "private", "protected", "public", "readonly", "require",
        "return", "set", "static", "string", "super", "switch", "symbol", "this",
        "throw", "true", "try", "type", "typeof", "undefined", "unique",
        "unknown", "var", "void", "while", "with", "yield",
    }
)

BUILTINS = frozenset(
    {
        "Array", "Boolean", "Date", "Error", "JSON", "Map", "Math", "Number",
        "Object", "Promise", "Proxy", "Reflect", "RegExp", "Set", "String",
        "Symbol", "WeakMap", "WeakSet", "console", "parseInt", "parseFloat",
        "isNaN", "isFinite", "encodeURIComponent", "decodeURIComponent",
        "undefined", "NaN", "Infinity", "globalThis", "process", "Buffer",
        "module", "exports", "require", "describe", "it", "test", "expect",
        "beforeEach", "afterEach", "beforeAll", "afterAll", "vi", "vitest",
    }
)

KIND_TO_TYPE = {
    "nullish": "0",
    "int": "1",
    "string": "2",
    "float": "3",
    "boolean": "4",
    "object": "5",
    "array": "6",
    "function": "7",
    "class": "8",
    "unknown": "9",
}

_IDENT = re.compile(r"[A-Za-z_$][A-Za-z0-9_$]*")


class CodecError(Exception):
    """Loud failure for missing paths or invalid maps."""


@dataclass(frozen=True)
class LegendEntry:
    glyph: str
    human: str
    kind: str
    anchor: str


@dataclass
class EncodeResult:
    files_encoded: int
    legend_path: str
    map_path: str


def serial_at(index: int) -> str:
    if index < 0:
        raise ValueError("serial index must be >= 0")
    # base-26 using a..z, no zero digit: 0->a ... 25->z, 26->aa
    n = index
    chars: list[str] = []
    while True:
        chars.append(chr(ord("a") + (n % 26)))
        n = n // 26 - 1
        if n < 0:
            break
    return "".join(reversed(chars))


def type_key_for_kind(kind: str) -> str:
    return KIND_TO_TYPE.get(kind, "9")


def _annotation_kind(ann: str | None) -> str:
    if not ann:
        return "unknown"
    a = ann.strip()
    if a.startswith("(") or "=>" in a:
        return "function"
    if a.endswith("[]") or a.startswith("Array<"):
        return "array"
    low = a.lower()
    if low in {"string"}:
        return "string"
    if low in {"number"}:
        return "float"
    if low in {"boolean"}:
        return "boolean"
    if low in {"void", "null", "undefined", "never"}:
        return "nullish"
    if low in {"object", "record"}:
        return "object"
    return "unknown"


def _find_declarations(source: str) -> list[tuple[str, str, int]]:
    """Return (name, kind, offset) for rename targets, discovery order."""
    found: list[tuple[str, str, int]] = []
    seen: set[str] = set()

    def add(name: str, kind: str, offset: int) -> None:
        if name in KEYWORDS or name in BUILTINS or name in seen:
            return
        if name.startswith("g") and len(name) >= 2 and name[1].isdigit():
            return  # already glyph-like
        seen.add(name)
        found.append((name, kind, offset))

    for m in re.finditer(
        r"\b(?:export\s+)?(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)",
        source,
    ):
        add(m.group(1), "function", m.start(1))

    for m in re.finditer(
        r"\b(?:export\s+)?class\s+([A-Za-z_$][\w$]*)",
        source,
    ):
        add(m.group(1), "class", m.start(1))

    for m in re.finditer(
        r"\b(?:export\s+)?(?:interface|type)\s+([A-Za-z_$][\w$]*)",
        source,
    ):
        add(m.group(1), "class", m.start(1))

    for m in re.finditer(
        r"\b(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?::\s*([^=;]+?))?\s*=\s*",
        source,
    ):
        name = m.group(1)
        ann = m.group(2)
        after = source[m.end() : m.end() + 40].lstrip()
        if after.startswith("(") or after.startswith("async") or after.startswith("function"):
            kind = "function"
        else:
            kind = _annotation_kind(ann)
        add(name, kind, m.start(1))

    # Parameters: name: Type inside (...) following function / => / method-ish
    for m in re.finditer(
        r"([A-Za-z_$][\w$]*)\s*:\s*([A-Za-z_$][\w$<>\[\]|&\s.,]+)(?=\s*[,)=])",
        source,
    ):
        name = m.group(1)
        # Skip property signatures in types that aren't params when preceded by poorly —
        # v0: treat as renameable locals if not keyword
        if name in {"readonly", "public", "private", "protected"}:
            continue
        # Avoid matching `function normalizeEmail(value: string)` function name again —
        # already added. Parameters still needed.
        if name in seen and any(n == name and k == "function" for n, k, _ in found):
            # could be same name shadowing — skip duplicate global map entry
            continue
        kind = _annotation_kind(m.group(2))
        add(name, kind, m.start(1))

    return found


def _iter_code_tokens(source: str) -> Iterable[tuple[str, int, int, bool]]:
    """Yield (text, start, end, is_ident) skipping strings/comments as non-ident."""
    i = 0
    n = len(source)
    while i < n:
        c = source[i]
        # line comment
        if c == "/" and i + 1 < n and source[i + 1] == "/":
            j = source.find("\n", i)
            if j < 0:
                j = n
            yield source[i:j], i, j, False
            i = j
            continue
        # block comment
        if c == "/" and i + 1 < n and source[i + 1] == "*":
            j = source.find("*/", i + 2)
            j = n if j < 0 else j + 2
            yield source[i:j], i, j, False
            i = j
            continue
        # string / template
        if c in {'"', "'", "`"}:
            quote = c
            j = i + 1
            while j < n:
                if source[j] == "\\":
                    j += 2
                    continue
                if source[j] == quote:
                    j += 1
                    break
                # template ${ } — keep scanning as non-ident chunk for v0 simplicity
                j += 1
            yield source[i:j], i, j, False
            i = j
            continue
        m = _IDENT.match(source, i)
        if m:
            yield m.group(0), m.start(), m.end(), True
            i = m.end()
            continue
        yield c, i, i + 1, False
        i += 1


def encode_text(
    source: str,
    *,
    path: str,
    start_serial: int = 0,
    existing: dict[str, LegendEntry] | None = None,
) -> tuple[str, list[LegendEntry]]:
    """Encode one file. Returns (encoded_text, new_legend_entries_for_this_file)."""
    table: dict[str, LegendEntry] = dict(existing or {})
    serial = start_serial
    new_entries: list[LegendEntry] = []

    decls = _find_declarations(source)
    for name, kind, _off in decls:
        if name in table:
            continue
        type_key = type_key_for_kind(kind)
        glyph = f"g{type_key}{serial_at(serial)}"
        serial += 1
        # Avoid colliding with an existing human identifier that looks like glyph
        while any(e.glyph == glyph for e in table.values()):
            glyph = f"g{type_key}{serial_at(serial)}"
            serial += 1
        anchor = path
        if kind != "function" and kind != "class":
            # Prefer "parameter of <fn>" when we can guess enclosing function
            owner = None
            for n2, k2, o2 in decls:
                if k2 == "function" and o2 < _off:
                    owner = table.get(n2).glyph if n2 in table else n2
            if owner:
                anchor = f"parameter of {owner}"
            else:
                anchor = path
        entry = LegendEntry(glyph=glyph, human=name, kind=kind, anchor=anchor)
        table[name] = entry
        new_entries.append(entry)

    rename = {e.human: e.glyph for e in table.values()}
    out: list[str] = []
    for text, _s, _e, is_ident in _iter_code_tokens(source):
        if is_ident and text in rename:
            out.append(rename[text])
        else:
            out.append(text)
    return "".join(out), new_entries


def decode_text(encoded: str, legend: list[LegendEntry] | Iterable[LegendEntry]) -> str:
    entries = list(legend)
    # Longest glyph first to avoid partial issues (glyphs are distinct prefixes mostly)
    mapping = sorted(
        ((e.glyph, e.human) for e in entries),
        key=lambda p: len(p[0]),
        reverse=True,
    )
    lookup = dict(mapping)
    out: list[str] = []
    for text, _s, _e, is_ident in _iter_code_tokens(encoded):
        if is_ident and text in lookup:
            out.append(lookup[text])
        else:
            out.append(text)
    return "".join(out)


def render_legend(legend: Iterable[LegendEntry]) -> str:
    lines = [
        "# Glyph LEGEND",
        "",
        f"codec_version: {CODEC_VERSION}",
        "",
        "| glyph | human | kind | anchor |",
        "|---|---|---|---|",
    ]
    for e in legend:
        lines.append(f"| `{e.glyph}` | `{e.human}` | {e.kind} | {e.anchor} |")
    lines.append("")
    # Also plain machine lines for protocol shape
    lines.append("## Machine lines")
    lines.append("")
    for e in legend:
        lines.append(f"{e.glyph}  {e.human}  {e.kind}  {e.anchor}")
    lines.append("")
    return "\n".join(lines)


def encode_paths(root: Path, rel_paths: list[str]) -> EncodeResult:
    root = root.resolve()
    existing: dict[str, LegendEntry] = {}
    all_entries: list[LegendEntry] = []
    serial = 0
    originals: dict[str, str] = {}

    for rel in sorted(rel_paths):
        path = root / rel
        if not path.is_file():
            raise CodecError(f"path not found: {rel}")
        source = path.read_text(encoding="utf-8")
        originals[rel] = source
        encoded, new_entries = encode_text(
            source,
            path=rel.replace("\\", "/"),
            start_serial=serial,
            existing=existing,
        )
        for e in new_entries:
            existing[e.human] = e
            all_entries.append(e)
            serial += 1
        # Re-encode with full table so earlier files pick up later? 
        # Cross-file: first pass builds table; for imports of names declared elsewhere,
        # we need a second pass. v0 two-pass:
        path.write_text(encoded, encoding="utf-8")  # temporary; rewritten below

    # Second pass: encode every file with the complete rename table
    full_legend = list(existing.values())
    for rel in sorted(rel_paths):
        source = originals[rel]
        encoded, _ = encode_text(
            source,
            path=rel.replace("\\", "/"),
            start_serial=0,
            existing=existing,
        )
        # encode_text with existing still discovers decls but won't reassign —
        # however it returns only new_entries. Re-apply rename from full table:
        encoded = _apply_rename(source, {e.human: e.glyph for e in full_legend})
        (root / rel).write_text(encoded, encoding="utf-8")

    glyph_dir = root / ".glyph"
    glyph_dir.mkdir(exist_ok=True)
    map_path = glyph_dir / "map.json"
    legend_path = root / "LEGEND.md"
    payload = {
        "codec_version": CODEC_VERSION,
        "paths": [p.replace("\\", "/") for p in sorted(rel_paths)],
        "originals": originals,
        "entries": [asdict(e) for e in full_legend],
    }
    map_path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    legend_path.write_text(render_legend(full_legend), encoding="utf-8")
    return EncodeResult(
        files_encoded=len(rel_paths),
        legend_path=str(legend_path.relative_to(root)).replace("\\", "/"),
        map_path=str(map_path.relative_to(root)).replace("\\", "/"),
    )


def _apply_rename(source: str, rename: dict[str, str]) -> str:
    out: list[str] = []
    for text, _s, _e, is_ident in _iter_code_tokens(source):
        if is_ident and text in rename:
            out.append(rename[text])
        else:
            out.append(text)
    return "".join(out)


def decode_paths(root: Path) -> int:
    """Restore originals from .glyph/map.json. Returns file count."""
    root = root.resolve()
    map_path = root / ".glyph" / "map.json"
    if not map_path.is_file():
        raise CodecError("missing .glyph/map.json — nothing to decode")
    payload = json.loads(map_path.read_text(encoding="utf-8"))
    originals = payload.get("originals") or {}
    entries = [
        LegendEntry(**e) for e in payload.get("entries", [])
    ]
    if originals:
        for rel, text in originals.items():
            (root / rel).write_text(text, encoding="utf-8")
        return len(originals)
    # Fallback: decode current files via legend
    count = 0
    for rel in payload.get("paths", []):
        path = root / rel
        body = path.read_text(encoding="utf-8")
        path.write_text(decode_text(body, entries), encoding="utf-8")
        count += 1
    return count


def decode_paths_from_edits(root: Path) -> int:
    """W1 accept path: decode current Glyph files through legend (keeps worker edits)."""
    root = root.resolve()
    map_path = root / ".glyph" / "map.json"
    if not map_path.is_file():
        raise CodecError("missing .glyph/map.json")
    payload = json.loads(map_path.read_text(encoding="utf-8"))
    entries = [LegendEntry(**e) for e in payload.get("entries", [])]
    count = 0
    for rel in payload.get("paths", []):
        path = root / rel
        body = path.read_text(encoding="utf-8")
        path.write_text(decode_text(body, entries), encoding="utf-8")
        count += 1
    return count
