#!/usr/bin/env python3
"""Concatenate the game sources into one game.js, wrapped in an IIFE."""
import glob, os, pathlib

root = pathlib.Path(__file__).parent
parts = sorted(glob.glob(str(root / 'src' / '*.js')))
out = ["(function () {", "'use strict';", ""]
for p in parts:
    out.append("/* ===== " + os.path.basename(p) + " ===== */")
    out.append(pathlib.Path(p).read_text())
    out.append("")
out.append("})();")
out_path = root / 'game.js'
if out_path.exists():
    out_path.unlink()
out_path.write_text("\n".join(out))
print("game.js written:", (root / 'game.js').stat().st_size, "bytes from", len(parts), "files")
