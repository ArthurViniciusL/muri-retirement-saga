#!/usr/bin/env python3
"""Check a produced PNG against the mechanical parts of the style guide.

This exists because four of the art rules are exactly checkable — palette membership,
tone count, binary alpha, grid size — and a machine should check those so the human
review can spend its attention on silhouette and readability, which a script cannot
judge.

    python3 verify_asset.py --role player src/assets/sprites/muri_idle_01.png
    python3 verify_asset.py --role enemy src/assets/sprites/bat_fly_*.png

Exit code is 1 if any file fails, so it can gate a batch before you report the asset as
done. A WARN never fails the run; it is a judgement call handed back to you.
"""

from __future__ import annotations

import argparse
import re
import struct
import sys
import zlib
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from pixelpng import RGB_TO_ZINC, tone_step  # noqa: E402

# role -> (expected size or None for "any multiple of 64", outline required)
ROLES: dict[str, tuple[tuple[int, int] | None, bool]] = {
    "player": ((64, 96), True),
    "enemy": ((64, 64), True),
    "thief": ((64, 64), True),
    "projectile": ((64, 64), True),
    "item": ((64, 64), True),
    "tile": ((64, 64), False),
    "hud": ((32, 32), True),
    "card": ((64, 64), True),
    "button": ((128, 128), True),
    "background": (None, False),
}

MAX_TONES = 4
NAME_RE = re.compile(r"^[a-z0-9]+(?:_[a-z0-9]+)*(?:_\d{2})?\.png$")


def decode_png(path: Path) -> tuple[int, int, list[list[tuple[int, int, int, int]]]]:
    """Minimal PNG reader for 8-bit truecolour, truecolour+alpha and indexed images."""
    data = path.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError("not a PNG file")
    pos = 8
    width = height = depth = ctype = 0
    idat = bytearray()
    palette: list[tuple[int, int, int]] = []
    trns: bytes = b""
    while pos < len(data):
        (length,) = struct.unpack(">I", data[pos : pos + 4])
        kind = data[pos + 4 : pos + 8]
        body = data[pos + 8 : pos + 8 + length]
        pos += 12 + length
        if kind == b"IHDR":
            width, height, depth, ctype = struct.unpack(">IIBB", body[:10])
        elif kind == b"PLTE":
            palette = [tuple(body[i : i + 3]) for i in range(0, len(body), 3)]  # type: ignore[misc]
        elif kind == b"tRNS":
            trns = body
        elif kind == b"IDAT":
            idat.extend(body)
        elif kind == b"IEND":
            break
    if depth != 8 or ctype not in (2, 3, 6):
        raise ValueError(f"unsupported PNG (bit depth {depth}, colour type {ctype})")
    channels = {2: 3, 3: 1, 6: 4}[ctype]
    raw = zlib.decompress(bytes(idat))
    stride = width * channels
    out: list[list[tuple[int, int, int, int]]] = []
    prev = bytearray(stride)
    offset = 0
    for _ in range(height):
        filt = raw[offset]
        line = bytearray(raw[offset + 1 : offset + 1 + stride])
        offset += 1 + stride
        for i in range(stride):
            a = line[i - channels] if i >= channels else 0
            b = prev[i]
            c = prev[i - channels] if i >= channels else 0
            if filt == 1:
                line[i] = (line[i] + a) & 0xFF
            elif filt == 2:
                line[i] = (line[i] + b) & 0xFF
            elif filt == 3:
                line[i] = (line[i] + (a + b) // 2) & 0xFF
            elif filt == 4:
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                pred = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[i] = (line[i] + pred) & 0xFF
        row: list[tuple[int, int, int, int]] = []
        for x in range(width):
            chunk = line[x * channels : (x + 1) * channels]
            if ctype == 6:
                row.append((chunk[0], chunk[1], chunk[2], chunk[3]))
            elif ctype == 2:
                row.append((chunk[0], chunk[1], chunk[2], 255))
            else:
                index = chunk[0]
                r, g, b_ = palette[index]
                alpha = trns[index] if index < len(trns) else 255
                row.append((r, g, b_, alpha))
        out.append(row)
        prev = line
    return width, height, out


def check(path: Path, role: str) -> tuple[list[str], list[str]]:
    failures: list[str] = []
    warnings: list[str] = []
    expected_size, needs_outline = ROLES[role]
    width, height, pixels = decode_png(path)

    # 1. Grid and scale — `art-grid-and-scale.md`.
    if expected_size is None:
        if width % 64 or height % 64:
            failures.append(
                f"size {width}x{height} is not a multiple of the locked 64 px grid"
            )
    elif (width, height) != expected_size:
        failures.append(
            f"size {width}x{height}, expected {expected_size[0]}x{expected_size[1]} for role '{role}'"
        )

    # 2. Palette and alpha — `art-palette-zinc.md`, `art-linework-and-texture.md`.
    tones: dict[str, int] = {}
    foreign: set[str] = set()
    partial_alpha = 0
    for row in pixels:
        for r, g, b, a in row:
            if a == 0:
                continue
            if a != 255:
                partial_alpha += 1
                continue
            name = RGB_TO_ZINC.get((r, g, b))
            if name is None:
                foreign.add(f"#{r:02X}{g:02X}{b:02X}")
            else:
                tones[name] = tones.get(name, 0) + 1
    if foreign:
        failures.append(
            "colours outside the zinc scale: " + ", ".join(sorted(foreign)[:8])
        )
    if partial_alpha:
        failures.append(
            f"{partial_alpha} semi-transparent pixels; alpha must be 0 or 255 "
            "(transparency as an effect is forbidden)"
        )
    if not tones and not foreign:
        failures.append("image is fully transparent")
    if len(tones) > MAX_TONES:
        failures.append(
            f"{len(tones)} zinc tones ({', '.join(sorted(tones, key=tone_step))}); "
            f"at most {MAX_TONES} per sprite — more reads as a gradient"
        )

    # 3. Tone range — `art-contrast-readability.md`.
    if tones:
        darkest = max(tones, key=tone_step)
        lightest = min(tones, key=tone_step)
        if role == "background":
            if tone_step(darkest) > 500:
                failures.append(
                    f"decorative asset uses {darkest}; background stays within zinc-50..zinc-500 "
                    "so it never competes with playable elements"
                )
        elif tone_step(darkest) < 700:
            failures.append(
                f"darkest tone is {darkest}; anything the player collides with or reads as "
                "interactive needs a tone in zinc-700..zinc-950"
            )
        if len(tones) == 1:
            warnings.append(f"single tone ({lightest}) — no carve, no shading, verify this is intended")

        # 4. Outline — `art-linework-and-texture.md`.
        if needs_outline:
            border = 0
            outlined = 0
            for y, row in enumerate(pixels):
                for x, (r, g, b, a) in enumerate(row):
                    if a != 255:
                        continue
                    neighbours = [
                        pixels[y + dy][x + dx][3]
                        if 0 <= y + dy < height and 0 <= x + dx < width
                        else 0
                        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1))
                    ]
                    if all(n == 255 for n in neighbours):
                        continue
                    border += 1
                    if RGB_TO_ZINC.get((r, g, b)) == darkest:
                        outlined += 1
            coverage = outlined / border if border else 0.0
            if coverage < 0.95:
                failures.append(
                    f"outline covers {coverage:.0%} of the silhouette edge; every edge pixel "
                    f"must be the sprite's darkest tone ({darkest})"
                )
            elif coverage < 1.0:
                warnings.append(f"outline covers {coverage:.0%} of the silhouette edge")

    # 5. File name — `art-asset-naming.md`.
    if not NAME_RE.match(path.name):
        failures.append(
            f"file name {path.name!r} does not match <entity>_<action>_<frame>.png in lower case"
        )
    if "sprites" in path.parts or "tilemaps" in path.parts or "assets" in path.parts:
        pass
    else:
        warnings.append("file is not under src/assets/ — move it before wiring it up")

    return failures, warnings


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("files", nargs="+", type=Path)
    parser.add_argument("--role", required=True, choices=sorted(ROLES))
    args = parser.parse_args()

    failed = False
    for path in args.files:
        try:
            failures, warnings = check(path, args.role)
        except Exception as exc:  # unreadable file is itself a failure
            print(f"FAIL {path}: {exc}")
            failed = True
            continue
        if failures:
            failed = True
            print(f"FAIL {path}")
            for item in failures:
                print(f"  - {item}")
        else:
            print(f"PASS {path}")
        for item in warnings:
            print(f"  ! {item}")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
