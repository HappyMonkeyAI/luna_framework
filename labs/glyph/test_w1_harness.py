#!/usr/bin/env python3
"""W1 harness tests: encode → edit glyphs → decode keeps edits.

Run:  python labs/glyph/test_w1_harness.py
"""
from __future__ import annotations

import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from codec import decode_paths_from_edits, encode_paths  # noqa: E402

SAMPLE = """\
export function normalizeEmail(value: string): string {
    return value.trim();
}
"""


class W1HarnessTests(unittest.TestCase):
    def test_decode_preserves_worker_body_edits(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            path = root / "src" / "domain" / "email.ts"
            path.parent.mkdir(parents=True)
            path.write_text(SAMPLE, encoding="utf-8")
            encode_paths(root, ["src/domain/email.ts"])
            body = path.read_text(encoding="utf-8")
            import re
            m = re.search(r"return (g2[a-z]+)\.trim\(\);", body)
            self.assertIsNotNone(m)
            assert m
            param = m.group(1)
            edited = body.replace(
                f"return {param}.trim();",
                f"return {param}.trim().toLowerCase();",
            )
            path.write_text(edited, encoding="utf-8")
            n = decode_paths_from_edits(root)
            self.assertEqual(n, 1)
            final = path.read_text(encoding="utf-8")
            self.assertIn("normalizeEmail", final)
            self.assertIn("value.trim().toLowerCase()", final)
            self.assertNotIn("g7", final)


if __name__ == "__main__":
    unittest.main()
