#!/usr/bin/env python3
"""W1 harness CLI for Glyph Track A.

  python labs/glyph/w1_harness.py encode --root DIR --path src/domain/email.ts
  python labs/glyph/w1_harness.py decode --root DIR
  python labs/glyph/w1_harness.py reset  --root DIR   # restore pre-encode originals

Encode writes Glyph sources + LEGEND.md + .glyph/map.json.
Decode (accept) maps worker Glyph edits back to human identifiers.
Reset abandons Glyph edits and restores the snapshot taken at encode time.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

from codec import CodecError, decode_paths, decode_paths_from_edits, encode_paths


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Glyph W1 encode/decode harness")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_enc = sub.add_parser("encode", help="Rename identifiers in paths; write LEGEND + map")
    p_enc.add_argument("--root", type=Path, required=True)
    p_enc.add_argument(
        "--path",
        action="append",
        dest="paths",
        required=True,
        help="Relative file path (repeatable)",
    )

    p_dec = sub.add_parser("decode", help="Decode Glyph edits to human names (keeps body edits)")
    p_dec.add_argument("--root", type=Path, required=True)

    p_reset = sub.add_parser("reset", help="Restore originals snapshotted at encode")
    p_reset.add_argument("--root", type=Path, required=True)

    args = parser.parse_args(argv)
    try:
        if args.cmd == "encode":
            result = encode_paths(args.root, args.paths)
            print(
                f"encoded {result.files_encoded} file(s); "
                f"legend={result.legend_path} map={result.map_path}"
            )
            return 0
        if args.cmd == "decode":
            n = decode_paths_from_edits(args.root)
            print(f"decoded {n} file(s) from Glyph edits")
            return 0
        if args.cmd == "reset":
            n = decode_paths(args.root)
            print(f"reset {n} file(s) to encode-time originals")
            return 0
    except CodecError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
