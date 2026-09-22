#!/usr/bin/env python3
"""Draws Muri's ranged projectile: a three-frame electric bolt, travelling right.

`guidelines.md` §5 and `system-design.md` §5 both say the ranged attack's projectile is
a separate sprite, but neither gives it a key or a frame count, so both are read from
the conventions the other entities already follow — see the report and the last section
of `asset-catalog.md`.

The bolt shares the screen with the fireball, and the two must never be confused: the
fireball is round with a trailing tail, so the bolt is built as its opposite — one
straight-edged flash with hard corners and a notched step, lying along its line of
travel. The shape is the classic bolt glyph, authored upright where it is recognisable
and then rotated as a whole, which is why the corners stay sharp instead of melting into
a wedge.

Electricity flickers, so the three frames move the notch and the spark while the head
and the tip stay put: the bolt looks alive without changing length or drifting off its
trajectory.

    python3 tools/art/muri_projectile.py --out src/assets/sprites/muri
"""

from __future__ import annotations

import argparse
import math
import sys
from pathlib import Path

sys.path.insert(0, ".agents/skills/design-asset/scripts")
from pixelpng import Canvas, save_frames  # noqa: E402

SIZE = 64

OUTLINE = "ink"  # carve and hatching
BODY = "umber"     # the bolt itself
CORE = "dust"     # the charged centre, the only light accent

ANGLE = -75.0         # degrees; the long axis lies along the travel direction, tip right
LENGTH, WIDTH = 47.0, 19.0
CX, CY = 32.0, 31.0

# The bolt glyph, upright, point at the bottom. Only the two notch pairs move between
# frames; the head (top) and the point are fixed so the sprite keeps its length.
HEAD_L, HEAD_R = (0.46, 0.00), (0.82, 0.00)
POINT = (0.22, 1.00)


def glyph(jitter: float) -> list[tuple[float, float]]:
    return [
        HEAD_L,
        (0.10 + jitter, 0.58),
        (0.40 - jitter, 0.58),
        POINT,
        (0.90 - jitter, 0.36),
        (0.56 + jitter, 0.36),
        HEAD_R,
    ]


def placed(points: list[tuple[float, float]], scale: float = 1.0) -> list[tuple[float, float]]:
    """Rotate the upright glyph onto the travel axis. `scale` shrinks it about its own
    centre, which is how the light core is kept strictly inside the body."""
    theta = math.radians(ANGLE)
    out = []
    for gx, gy in points:
        px = (gx - 0.5) * WIDTH * scale
        py = (gy - 0.5) * LENGTH * scale
        out.append(
            (
                CX + px * math.cos(theta) - py * math.sin(theta),
                CY + px * math.sin(theta) + py * math.cos(theta),
            )
        )
    return out


def fill_polygon(canvas: Canvas, points: list[tuple[float, float]], tone: str) -> None:
    """Scanline fill. The bolt is one polygon, not a stroked path: a pen with thickness
    rounds the corners, and the corners are the whole silhouette here."""
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


def eroded(canvas: Canvas, margin: int) -> set[tuple[int, int]]:
    """Pixels that are at least `margin` away from the edge of the silhouette.

    The light core is intersected with this set so it can never reach the border: a
    light pixel on the edge would break the carve, which has to be the darkest tone the
    whole way round (`art-linework-and-texture.md`).
    """
    inside: set[tuple[int, int]] = set()
    for y in range(SIZE):
        for x in range(SIZE):
            if canvas.get(x, y)[3] == 0:
                continue
            if all(
                canvas.get(x + dx, y + dy)[3] != 0
                for dx in range(-margin, margin + 1)
                for dy in range(-margin, margin + 1)
            ):
                inside.add((x, y))
    return inside


def bolt(jitter: float, spark: tuple[int, int] | None) -> Canvas:
    canvas = Canvas(SIZE, SIZE)
    shape = glyph(jitter)
    fill_polygon(canvas, placed(shape), BODY)

    # Engraved shading along the underside. Sparse, because a 10 px wide bolt hatched
    # end to end turns into noise at this resolution.
    canvas.hatch(6, int(CY), 52, 26, OUTLINE, spacing=5)

    # The charged centre: a flat light streak, inset from the body and clipped to the
    # interior. Not a glow — opacity and bloom are forbidden.
    interior = eroded(canvas, 2)
    core = Canvas(SIZE, SIZE)
    fill_polygon(core, placed(shape, scale=0.45), CORE)
    for y in range(SIZE):
        for x in range(SIZE):
            if core.get(x, y)[3] != 0 and (x, y) in interior:
                canvas.px(x, y, CORE)

    # One detached spark, thrown off the flash. It carries the flicker between frames
    # without touching the silhouette of the bolt itself.
    if spark is not None:
        sx, sy = spark
        for dx, dy in ((0, 0), (1, 0), (0, 1), (2, 1), (1, 2)):
            canvas.px(sx + dx, sy + dy, BODY)

    canvas.outline(OUTLINE)
    return canvas


def frames() -> list[Canvas]:
    """Three flickers. The loop closes: the notch returns to where it started and the
    head and point never moved."""
    return [
        bolt(jitter=0.00, spark=(16, 16)),
        bolt(jitter=0.05, spark=(45, 44)),
        bolt(jitter=-0.04, spark=None),
    ]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, default=Path("src/assets/sprites/muri"))
    args = parser.parse_args()

    built = frames()
    for path, frame in zip(save_frames(built, args.out, "muri", "projectile"), built):
        print(f"{path.name}  tones={frame.tones()}")
        print(frame.preview())
        print()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
