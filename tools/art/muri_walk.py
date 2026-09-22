#!/usr/bin/env python3
"""Converts the owner's Muri walk drawings into the game's `muri_walk_NN` frames.

The source frames in `tools/art/source/muri_walk/` are hand-drawn at about
157x247 with anti-aliased edges and full greyscale. The game needs 64x96 frames in at
most four zinc tones, with binary alpha and a zinc-950 outline (`art-grid-and-scale.md`,
`art-palette-zinc.md`, `art-linework-and-texture.md`). This script does that conversion
so the drawings stay the source and a redraw is a re-run.

Steps per frame:

1. Align: the frames have different widths because the stride changes, so each one is
   anchored on the horizontal centre of the head, which barely moves in a walk cycle.
   Every frame keeps the feet on the bottom row.
2. Downscale with a box filter onto the 62x94 area inside a 1 px margin, which the
   outline needs.
3. Cut the alpha at 50%: a pixel is either part of Muri or not.
4. Quantise brightness to three body tones (zinc-100 light, zinc-500 mid, zinc-800
   dark) and keep the darkest ink lines as zinc-950.
5. Carve the zinc-950 outline around the silhouette.

    python3 tools/art/muri_walk.py --out src/assets/sprites/muri/walk
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, ".agents/skills/design-asset/scripts")
from pixelpng import ZINC, Canvas  # noqa: E402
from verify_asset import decode_png  # noqa: E402

SOURCE = Path("tools/art/source/muri_walk")
WIDTH, HEIGHT = 64, 96  # Muri, per `art-grid-and-scale.md`
MARGIN = 1
HEAD_ROWS = 0.28  # top share of the drawing used to find the head centre

# Brightness cut points (0–255) for the four tones.
INK_BELOW = 45
DARK_BELOW = 105
MID_BELOW = 185
TONES = ("zinc-950", "zinc-800", "zinc-500", "zinc-100")

Pixels = list[list[tuple[int, int, int, int]]]


def load(path: Path) -> Pixels:
    _, _, pixels = decode_png(path)
    return pixels


def head_centre(pixels: Pixels) -> float:
    rows = pixels[: int(len(pixels) * HEAD_ROWS)]
    xs = [x for row in rows for x, p in enumerate(row) if p[3] > 127]
    return sum(xs) / len(xs)


def tone_for(luma: float) -> str:
    if luma < INK_BELOW:
        return TONES[0]
    if luma < DARK_BELOW:
        return TONES[1]
    if luma < MID_BELOW:
        return TONES[2]
    return TONES[3]


def convert(pixels: Pixels, anchor: float, scale: float) -> Canvas:
    src_h = len(pixels)
    src_w = len(pixels[0])
    canvas = Canvas(WIDTH, HEIGHT)
    inner_bottom = HEIGHT - MARGIN
    centre_x = WIDTH / 2

    for ty in range(MARGIN, inner_bottom):
        # Map target rows so the source bottom row lands on the last inner row.
        sy0 = src_h - (inner_bottom - ty) / scale
        sy1 = sy0 + 1 / scale
        for tx in range(MARGIN, WIDTH - MARGIN):
            sx0 = anchor + (tx - centre_x) / scale
            sx1 = sx0 + 1 / scale
            alpha_sum = 0.0
            luma_sum = 0.0
            count = 0
            for sy in range(max(0, int(sy0)), min(src_h, int(sy1) + 1)):
                for sx in range(max(0, int(sx0)), min(src_w, int(sx1) + 1)):
                    r, g, b, a = pixels[sy][sx]
                    count += 1
                    alpha_sum += a
                    luma_sum += a * (0.299 * r + 0.587 * g + 0.114 * b)
            if count == 0 or alpha_sum / count < 128:
                continue
            canvas.px(tx, ty, tone_for(luma_sum / alpha_sum))
    canvas.outline(TONES[0])
    return canvas


def walk_scale(frames: list[Pixels], anchors: list[float]) -> float:
    # One scale for every frame, so Muri never changes size mid-cycle: the tallest
    # drawing fills the inner height, and the widest reach from the head must fit too.
    src_h = max(len(pixels) for pixels in frames)
    reach = max(
        max(anchor, len(pixels[0]) - anchor) for pixels, anchor in zip(frames, anchors)
    )
    inner_w = WIDTH / 2 - MARGIN
    return min((HEIGHT - 2 * MARGIN) / src_h, inner_w / reach)


def load_walk() -> tuple[list[Pixels], list[float], float]:
    frames = [load(path) for path in sorted(SOURCE.glob("*.png"))]
    anchors = [head_centre(pixels) for pixels in frames]
    return frames, anchors, walk_scale(frames, anchors)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--out", type=Path, default=Path("src/assets/sprites/muri/walk"))
    args = parser.parse_args()

    frames, anchors, scale = load_walk()

    for index, (pixels, anchor) in enumerate(zip(frames, anchors), start=1):
        canvas = convert(pixels, anchor, scale)
        path = canvas.save(args.out / f"muri_walk_{index:02d}.png")
        print(f"{path}  tones={canvas.tones()}")
    print(f"scale {scale:.3f}, {len(frames)} frames")
    assert set(TONES) <= set(ZINC)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
