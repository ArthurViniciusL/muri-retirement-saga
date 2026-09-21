#!/usr/bin/env python3
"""Draws the bat: four flight frames and three shatter frames.

The bat owns the high band (`gameplay-enemies.md`), so its silhouette has to read as
"wide and angular" at a glance, against the wild cat (long and low) and the fireball
(round and radiating). The wings are therefore generated from a small set of joint
points instead of being hand-typed: the flap is then a single parameter, the four
frames share one body, and the proportions cannot drift between frames.

    python3 tools/art/bat.py --out src/assets/sprites
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, ".agents/skills/design-asset/scripts")
from pixelpng import Canvas, save_frames  # noqa: E402

SIZE = 64
MIRROR = 63  # body is symmetric about x = 31.5, so the left wing is 63 - x

OUTLINE = "zinc-950"  # carve, arm bones, hatching
BODY = "zinc-800"     # torso and head
MEMBRANE = "zinc-700" # wing skin, one step lighter so the wings read as separate
EYE = "zinc-300"      # the only light accent, so the head is found first


# ----------------------------------------------------------------- geometry helpers

def fill_polygon(canvas: Canvas, points: list[tuple[float, float]], tone: str) -> None:
    """Scanline fill. Wings are polygons, not ASCII, so one parameter drives the flap."""
    ys = [p[1] for p in points]
    for y in range(int(min(ys)), int(max(ys)) + 1):
        crossings = []
        for i in range(len(points)):
            x0, y0 = points[i]
            x1, y1 = points[(i + 1) % len(points)]
            if (y0 <= y < y1) or (y1 <= y < y0):
                crossings.append(x0 + (y - y0) * (x1 - x0) / (y1 - y0))
        crossings.sort()
        for i in range(0, len(crossings) - 1, 2):
            for x in range(int(round(crossings[i])), int(round(crossings[i + 1])) + 1):
                canvas.px(x, y, tone)


def ellipse(canvas: Canvas, cx: float, cy: float, rx: float, ry: float, tone: str) -> None:
    for y in range(SIZE):
        for x in range(SIZE):
            if ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1.0:
                canvas.px(x, y, tone)


def mirrored_onto(canvas: Canvas, tone_filter: str | None = None) -> None:
    """Copy the right half onto the left, so both wings are identical by construction."""
    for y in range(SIZE):
        for x in range(32, SIZE):
            pixel = canvas.pixels[y][x]
            if pixel[3] != 0:
                canvas.pixels[y][MIRROR - x] = pixel


# --------------------------------------------------------------------------- the bat

def wing_points(span: float, tip_y: float) -> tuple[list[tuple[float, float]], list[tuple[float, float]]]:
    """Right wing: the membrane outline, and the finger joints drawn as carved bone."""
    shoulder = (34.0, 23.0)
    tip = (34.0 + span, tip_y)
    elbow = (34.0 + span * 0.62, tip_y + 3.0)
    # Trailing edge: two scallops cut between the finger tips. The notch is what makes
    # the silhouette angular instead of a smooth aerofoil, and it is the single feature
    # that separates the bat from the round fireball at gameplay speed.
    f1 = (tip[0] - 5.0, tip[1] + 11.0)
    notch = (elbow[0] - 1.0, elbow[1] + 5.0)
    f2 = (elbow[0] - 7.0, elbow[1] + 13.0)
    hip = (34.0, 35.0)
    membrane = [shoulder, elbow, tip, f1, notch, f2, hip]
    bones = [shoulder, elbow, tip, f1, notch, f2]
    return membrane, bones


def body() -> Canvas:
    """Torso, head and ears on their own canvas so the body can be carved separately.

    The carve matters: membrane (zinc-700) and torso (zinc-800) are adjacent steps on
    the scale and may never touch without a line between them
    (`art-contrast-readability.md`). Outlining the body before stamping it on the wing
    is what puts that line there.
    """
    canvas = Canvas(SIZE, SIZE)
    ellipse(canvas, 31.0, 33.0, 4.5, 9.0, BODY)    # torso, narrow so the wings dominate
    ellipse(canvas, 32.0, 21.0, 6.0, 5.5, BODY)    # head
    fill_polygon(canvas, [(27.0, 20.0), (28.0, 11.0), (31.5, 19.0)], BODY)  # ear
    fill_polygon(canvas, [(33.0, 19.0), (36.5, 12.0), (37.0, 21.0)], BODY)  # ear
    fill_polygon(canvas, [(35.0, 18.0), (42.0, 22.0), (35.0, 26.0)], BODY)  # snout, facing right
    canvas.rect(28, 41, 2, 4, BODY)                # foot
    canvas.rect(32, 41, 2, 4, BODY)                # foot
    canvas.hatch(31, 26, 7, 17, OUTLINE, spacing=4)  # belly shadow, light from above left
    canvas.outline(OUTLINE)
    return canvas


BODY_LAYER = None  # built once; every frame shares it so proportions cannot drift


def bat(span: float = 22.0, tip_y: float = 14.0) -> Canvas:
    global BODY_LAYER
    if BODY_LAYER is None:
        BODY_LAYER = body()

    canvas = Canvas(SIZE, SIZE)
    membrane, bones = wing_points(span, tip_y)
    fill_polygon(canvas, membrane, MEMBRANE)

    # Hatching sits on the trailing band of the membrane only, where the wing curves
    # away from the light. Shading the whole wing turns it into noise at 64 px.
    canvas.hatch(int(bones[1][0]) - 6, int(bones[3][1]) - 6, 30, 16, OUTLINE, spacing=4)

    # Carved bone. Two fingers, not five: a third line reads as texture, not structure.
    for a, b in ((bones[0], bones[1]), (bones[1], bones[2]), (bones[1], bones[3]),
                 (bones[1], bones[5])):
        canvas.line(int(a[0]), int(a[1]), int(b[0]), int(b[1]), OUTLINE)

    mirrored_onto(canvas)
    canvas.place(BODY_LAYER, 0, 0)

    # Head detail is never mirrored: the bat is authored facing right and flipped in
    # code (`art-asset-naming.md`).
    canvas.line(30, 25, 39, 25, OUTLINE)           # jaw, so the snout reads as a muzzle
    canvas.rect(34, 19, 2, 2, EYE)                 # eye
    canvas.px(33, 19, OUTLINE)
    canvas.px(33, 21, OUTLINE)
    canvas.px(36, 20, OUTLINE)
    canvas.px(39, 23, EYE)                         # fang
    canvas.px(40, 22, OUTLINE)

    canvas.outline(OUTLINE)
    return canvas


def fly_frames() -> list[Canvas]:
    """Down-beat, mid, up-beat, mid — the loop closes because frame 4 repeats frame 2's
    geometry one pixel higher, which leads straight back into frame 1."""
    return [
        bat(span=26.0, tip_y=12.0),
        bat(span=27.0, tip_y=21.0),
        bat(span=24.0, tip_y=32.0),
        bat(span=27.0, tip_y=22.0),
    ]


# ------------------------------------------------------------------------ the shatter

def shatter(source: Canvas, spread: int, drop: set[int]) -> Canvas:
    """Break the carve into blocks and push each one outwards.

    The defeat is a shatter and not a fade because opacity is forbidden
    (`art-linework-and-texture.md`), so the disappearance has to be carried by the line
    itself coming apart. Blocks of 6 px keep each fragment big enough to still read as a
    piece of engraved wing rather than as dust.
    """
    out = Canvas(SIZE, SIZE)
    block = 6
    for y in range(SIZE):
        for x in range(SIZE):
            pixel = source.pixels[y][x]
            if pixel[3] == 0:
                continue
            bx, by = x // block, y // block
            if (bx * 7 + by * 5) % 11 in drop:
                continue
            # Direction is the block's own offset from the body centre, so fragments fly
            # apart radially and the group still reads as one burst.
            dx = (bx * block + block / 2) - 31.0
            dy = (by * block + block / 2) - 29.0
            norm = max(abs(dx), abs(dy), 1.0)
            tx = x + round(dx / norm * spread)
            ty = y + round(dy / norm * spread) + spread // 2
            if 1 <= tx < SIZE - 1 and 1 <= ty < SIZE - 1:
                out.pixels[ty][tx] = pixel
    out.outline(OUTLINE)
    return out


def defeat_frames() -> list[Canvas]:
    # Wings half folded first: an exploding 60 px wingspan would run off the canvas and
    # lose its outline, and a bat that is already collapsing reads better anyway.
    folded = bat(span=14.0, tip_y=24.0)
    cracked = folded.copy()
    # Frame 1 is the hit itself: the line splits but nothing has moved yet, which is
    # what makes the shatter legible at three frames.
    for x0, y0, x1, y1 in ((27, 17, 33, 40), (24, 28, 39, 24), (34, 20, 30, 43)):
        cracked.line(x0, y0, x1, y1, OUTLINE)
    return [
        cracked,
        shatter(folded, spread=3, drop={4}),
        shatter(folded, spread=8, drop={0, 2, 4, 6, 8, 9}),
    ]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, default=Path("src/assets/sprites"))
    args = parser.parse_args()

    for action, frames in (("fly", fly_frames()), ("defeat", defeat_frames())):
        for path, frame in zip(save_frames(frames, args.out, "bat", action), frames):
            print(f"{path.name}  tones={frame.tones()}")
            print(frame.preview())
            print()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
