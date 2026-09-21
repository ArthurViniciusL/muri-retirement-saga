#!/usr/bin/env python3
"""Draws the HUD heart, full and empty — the whole life bar.

Muri has five hearts and damage is always one whole heart (`gameplay-health.md`), so
the bar is five copies of these two icons and no half state exists. Both states share
one silhouette: only the tone and the carved-out centre change, because the difference
between "have" and "lost" may never be carried by opacity
(`art-linework-and-texture.md`).

The shape is generated from lobes and a point rather than typed as ASCII: a heart is
symmetric, and a formula keeps the two lobes identical in a way a hand-typed grid does
not. The woodcut character comes from the carve and the hatching, not from wobbling the
outline — `gameplay-health.md` only forbids a *generic* icon, and an irregular edge at
32 px reads as a mistake rather than as a chisel.

    python3 tools/art/heart.py --out src/assets/sprites
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, ".agents/skills/design-asset/scripts")
from pixelpng import Canvas  # noqa: E402

SIZE = 32  # HUD icon, per `art-grid-and-scale.md`

OUTLINE = "zinc-950"  # carve, hatching, cleft
BODY = "zinc-800"     # the filled heart
HOLLOW = "zinc-700"   # the rim of a lost heart
GLINT = "zinc-300"    # single light accent, upper left, so a full heart is found first

LOBES = ((10.5, 13.0), (20.5, 13.0))
LOBE_R = 6.4


def heart(tone: str) -> Canvas:
    """The silhouette: two lobes and a tapering point, with a cleft cut between them."""
    canvas = Canvas(SIZE, SIZE)
    for y in range(SIZE):
        for x in range(SIZE):
            in_lobe = any((x - cx) ** 2 + (y - cy) ** 2 <= LOBE_R**2 for cx, cy in LOBES)
            in_point = False
            if 13 <= y <= 27:
                t = (y - 13) / 14.0
                if 4.0 + t * 11.0 <= x <= 27.0 - t * 11.0:
                    in_point = True
            if in_lobe or in_point:
                canvas.px(x, y, tone)
    # The cleft is cut, not drawn: cutting it means `outline()` carves its walls too, so
    # the notch reads at 32 px instead of closing up.
    for y in range(5, 11):
        depth = 3 - (y - 5) // 2
        for x in range(15 - depth, 16 + depth):
            canvas.px(x, y, None)
    return canvas


def build_full() -> Canvas:
    canvas = heart(BODY)
    # Light from the upper left, the same direction as every other asset in the game.
    canvas.hatch(16, 12, 16, 18, OUTLINE, spacing=3)
    canvas.rect(8, 9, 3, 2, GLINT)
    canvas.px(7, 11, GLINT)
    canvas.outline(OUTLINE)
    return canvas


def build_empty() -> Canvas:
    """Same silhouette, hollowed out: a lost heart is an empty carve, never a faded one.

    The centre is removed rather than shaded, so `outline()` carves the inner wall as
    well and the ring reads as an engraved outline at HUD size.
    """
    canvas = heart(HOLLOW)
    source = heart(HOLLOW)
    radius = 4  # rim thickness once the outline is carved on both walls
    kernel = [
        (dx, dy)
        for dx in range(-radius, radius + 1)
        for dy in range(-radius, radius + 1)
        if dx * dx + dy * dy <= radius * radius
    ]
    for y in range(SIZE):
        for x in range(SIZE):
            if all(source.get(x + dx, y + dy)[3] != 0 for dx, dy in kernel):
                canvas.px(x, y, None)
    canvas.outline(OUTLINE)
    return canvas


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, default=Path("src/assets/sprites"))
    args = parser.parse_args()

    for name, canvas in (("ui_heart_full", build_full()), ("ui_heart_empty", build_empty())):
        path = canvas.save(args.out / f"{name}.png")
        print(f"{name}  tones={canvas.tones()}")
        print(canvas.preview())
        print(f"saved {path}\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
