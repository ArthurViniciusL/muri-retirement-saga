#!/usr/bin/env python3
"""Cuts the white background out of the owner's Muri crouch drawings.

The sources in `tools/art/source/muri_crouch/` are JPEGs on a white background. Muri is
shown from the drawings themselves (`art-grid-and-scale.md`), so the only processing is
the background: near-white pixels are flood-filled from the image border, which keeps
the white helmet and vest opaque inside their ink lines, and the result is cropped to
the silhouette.

    python3 tools/art/muri_crouch.py --out src/assets/sprites/muri/crouch
"""

from __future__ import annotations

import argparse
import subprocess
from collections import deque
from pathlib import Path

SOURCE = Path("tools/art/source/muri_crouch")
BACKGROUND_LUMA = 235

Pixels = list[list[tuple[int, int, int, int]]]


def decode_jpeg(path: Path) -> Pixels:
    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
         "stream=width,height", "-of", "csv=p=0", str(path)],
        check=True, capture_output=True, text=True,
    )
    width, height = (int(v) for v in probe.stdout.strip().split(","))
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-f", "rawvideo", "-pix_fmt", "rgba", "-"],
        check=True, capture_output=True,
    ).stdout
    return [
        [tuple(raw[(y * width + x) * 4:(y * width + x) * 4 + 4]) for x in range(width)]
        for y in range(height)
    ]


def encode_png(pixels: Pixels, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    raw = bytes(channel for row in pixels for p in row for channel in p)
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba",
         "-s", f"{len(pixels[0])}x{len(pixels)}", "-i", "-", str(path)],
        input=raw, check=True,
    )


def luma(p: tuple[int, int, int, int]) -> float:
    return 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2]


def remove_background(pixels: Pixels) -> Pixels:
    h, w = len(pixels), len(pixels[0])
    background = [[False] * w for _ in range(h)]
    queue = deque(
        (x, y) for y in range(h) for x in range(w) if x in (0, w - 1) or y in (0, h - 1)
    )
    while queue:
        x, y = queue.popleft()
        if not (0 <= x < w and 0 <= y < h) or background[y][x]:
            continue
        if luma(pixels[y][x]) < BACKGROUND_LUMA:
            continue
        background[y][x] = True
        queue.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    return [
        [(r, g, b, 0 if background[y][x] else 255) for x, (r, g, b, _) in enumerate(row)]
        for y, row in enumerate(pixels)
    ]


def crop(pixels: Pixels) -> Pixels:
    rows = [y for y, row in enumerate(pixels) if any(p[3] for p in row)]
    cols = [x for x in range(len(pixels[0])) if any(row[x][3] for row in pixels)]
    return [row[cols[0]:cols[-1] + 1] for row in pixels[rows[0]:rows[-1] + 1]]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--out", type=Path, default=Path("src/assets/sprites/muri/crouch"))
    args = parser.parse_args()

    for path in sorted(SOURCE.glob("*.jpg")):
        pixels = crop(remove_background(decode_jpeg(path)))
        out = args.out / f"{path.stem}.png"
        encode_png(pixels, out)
        print(f"{out}  {len(pixels[0])}x{len(pixels)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
