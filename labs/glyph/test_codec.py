#!/usr/bin/env python3
"""Tests for Glyph codec v0 (naming + legend + round-trip).

Run:  python labs/glyph/test_codec.py
"""
from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from codec import (  # noqa: E402
    CodecError,
    decode_text,
    encode_paths,
    encode_text,
    render_legend,
    serial_at,
    type_key_for_kind,
)


SAMPLE = """\
export function normalizeEmail(value: string): string {
    return value.trim();
}
"""


class SerialTests(unittest.TestCase):
    def test_serial_is_base26_letters(self) -> None:
        self.assertEqual(serial_at(0), "a")
        self.assertEqual(serial_at(25), "z")
        self.assertEqual(serial_at(26), "aa")


class TypeKeyTests(unittest.TestCase):
    def test_known_kinds(self) -> None:
        self.assertEqual(type_key_for_kind("function"), "7")
        self.assertEqual(type_key_for_kind("string"), "2")
        self.assertEqual(type_key_for_kind("unknown"), "9")


class EncodeDecodeTests(unittest.TestCase):
    def test_encode_renames_function_and_param(self) -> None:
        encoded, legend = encode_text(SAMPLE, path="src/domain/email.ts")
        self.assertIn("export function g7", encoded)
        self.assertNotIn("normalizeEmail", encoded)
        self.assertNotIn("value", encoded)
        self.assertIn(": string", encoded)  # type annotation text stays
        names = {e.human for e in legend}
        self.assertEqual(names, {"normalizeEmail", "value"})

    def test_round_trip_restores_source(self) -> None:
        encoded, legend = encode_text(SAMPLE, path="src/domain/email.ts")
        restored = decode_text(encoded, legend)
        self.assertEqual(restored, SAMPLE)

    def test_does_not_rename_inside_string_literals(self) -> None:
        src = 'export function label(): string { return "normalizeEmail"; }\n'
        encoded, legend = encode_text(src, path="a.ts")
        self.assertIn('"normalizeEmail"', encoded)
        self.assertEqual(decode_text(encoded, legend), src)

    def test_skips_keywords_and_builtins(self) -> None:
        src = "export function wrap(x: string): string { return String(x); }\n"
        encoded, _legend = encode_text(src, path="a.ts")
        self.assertIn("String(", encoded)

    def test_deterministic_across_calls(self) -> None:
        a, la = encode_text(SAMPLE, path="src/domain/email.ts")
        b, lb = encode_text(SAMPLE, path="src/domain/email.ts")
        self.assertEqual(a, b)
        self.assertEqual(
            [(e.glyph, e.human) for e in la],
            [(e.glyph, e.human) for e in lb],
        )


class LegendTests(unittest.TestCase):
    def test_legend_format_has_glyph_human_kind_anchor(self) -> None:
        _enc, legend = encode_text(SAMPLE, path="src/domain/email.ts")
        text = render_legend(legend)
        self.assertRegex(text, r"g7[a-z]+\s+normalizeEmail\s+function\s+src/domain/email\.ts")
        self.assertRegex(text, r"g2[a-z]+\s+value\s+string\s+")


class PathEncodeTests(unittest.TestCase):
    def test_encode_paths_writes_legend_and_map(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            src = root / "src" / "domain"
            src.mkdir(parents=True)
            target = src / "email.ts"
            target.write_text(SAMPLE, encoding="utf-8")
            result = encode_paths(root, ["src/domain/email.ts"])
            self.assertTrue((root / "LEGEND.md").is_file())
            self.assertTrue((root / ".glyph" / "map.json").is_file())
            body = target.read_text(encoding="utf-8")
            self.assertNotIn("normalizeEmail", body)
            self.assertIn("normalizeEmail", (root / "LEGEND.md").read_text(encoding="utf-8"))
            mapping = json.loads((root / ".glyph" / "map.json").read_text(encoding="utf-8"))
            self.assertIn("entries", mapping)
            self.assertEqual(result.files_encoded, 1)

    def test_encode_missing_path_fails_loudly(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            with self.assertRaises(CodecError):
                encode_paths(root, ["nope.ts"])


if __name__ == "__main__":
    unittest.main()
