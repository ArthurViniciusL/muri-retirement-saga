#!/usr/bin/env python3
"""Draws the fireball: four trajectory frames and three shatter frames.

The fireball owns the middle band (`gameplay-enemies.md`), between the bat above and
the wild cat on the ground, so its silhouette has to read as "round and radiating"
against the bat (wide and angular) and the cat (long and low). The outline is therefore
generated from a radial function rather than typed as ASCII: the flicker is then a
single phase parameter, the four frames share one body, and the flame cannot drift into
a different size between frames.

The head is round and compact and the tail trails behind it, which is what tells the
player the thing is travelling rather than hovering. Authored travelling **right**; the
left-facing version is mirrored at runtime (`art-asset-naming.md`).

    python3 tools/art/fireball.py --out src/assets/sprites/fireball
"""

from __future__ import annotations

import argparse
import math
import sys
from pathlib import Path

sys.path.insert(0, ".agents/skills/design-asset/scripts")
from pixelpng import Canvas, save_frames  # noqa: E402

SIZE = 64
CX, CY = 40.0, 31.5  # the head sits well to the right; the tail needs the room behind it

OUTLINE = "zinc-950"  # carve, radial tongues, hatching
FLAME = "zinc-800"    # the body of the flame
CORE = "zinc-300"     # the only light accent, so the hot centre is found first

HEAD = 12.5    # head radius; everything else is expressed as a multiple of it
TRAIL = 1.05   # how far the tail stretches behind the head, as a multiple of HEAD
LICKS = 3      # tongues in the tail; three read as flame, five read as a star
MAX_R = 26.0   # clamp: the outline grows outwards and needs a 1 px margin


def flame_radius(theta: float, phase: float, trail: float = TRAIL) -> float:
    """Distance from the centre to the edge of the flame at one angle.

    The head term barely moves (10%), so the leading arc the player has to judge to
    dodge keeps the same size in every frame. All the motion is in the tail term, which
    is one-sided — `max(0, -cos)` — so only the half pointing backwards stretches. That
    asymmetry is the whole reason the sprite reads as travelling instead of hovering.
    """
    head = 1.0 + 0.10 * math.sin(5.0 * theta + phase)
    back = max(0.0, -math.cos(theta)) ** 1.2
    licks = 1.0 + 0.30 * math.sin(LICKS * theta + phase)
    return min(HEAD * head * (1.0 + trail * back * licks), MAX_R)


def fireball(phase: float = 0.0, trail: float = TRAIL) -> Canvas:
    canvas = Canvas(SIZE, SIZE)

    for y in range(SIZE):
        for x in range(SIZE):
            dx, dy = x - CX, y - CY
            if math.hypot(dx, dy) <= flame_radius(math.atan2(dy, dx), phase, trail):
                canvas.px(x, y, FLAME)

    # Hatching on the tail only, and sparse. The head is the part the player reads to
    # dodge, so it stays a flat mass; hatching it as well turns the sprite into texture
    # at 64 px and costs the silhouette.
    canvas.hatch(4, 14, int(CX) - 14, 36, OUTLINE, spacing=5)

    # Carved tongues inside the head, from the core outwards: the radiating structure
    # that separates this silhouette from the bat's angular one, kept short so the
    # outer arc stays clean.
    for i in range(5):
        theta = phase / 5.0 + i * 2.0 * math.pi / 5.0
        canvas.line(
            int(CX + math.cos(theta) * 5.0),
            int(CY + math.sin(theta) * 5.0),
            int(CX + math.cos(theta) * (HEAD - 2.0)),
            int(CY + math.sin(theta) * (HEAD - 2.0)),
            OUTLINE,
        )

    # Two long carves splitting the tail into licks, so the trail reads as flame coming
    # apart rather than as one smear.
    for sign in (-1.0, 1.0):
        theta = math.pi + sign * 0.42
        reach = flame_radius(theta, phase, trail)
        canvas.line(
            int(CX + math.cos(theta) * (HEAD * 0.6)),
            int(CY + math.sin(theta) * (HEAD * 0.6)),
            int(CX + math.cos(theta) * (reach - 1.5)),
            int(CY + math.sin(theta) * (reach - 1.5)),
            OUTLINE,
        )

    # The hot centre, offset towards the leading edge so the flame reads as pushed from
    # behind. A flat light tone with a carve around it — not a glow, because opacity and
    # bloom are forbidden (`art-linework-and-texture.md`).
    for y in range(SIZE):
        for x in range(SIZE):
            distance = math.hypot(x - (CX + 1.5), y - CY)
            if distance <= 4.2:
                canvas.px(x, y, CORE)
            elif distance <= 5.4:
                canvas.px(x, y, OUTLINE)
    canvas.hatch(int(CX) - 3, int(CY) + 1, 5, 5, OUTLINE, spacing=3)  # light from the upper right

    canvas.outline(OUTLINE)
    return canvas


def move_frames() -> list[Canvas]:
    """Four phases of the same flame. The loop closes because a full 2*pi of phase is
    spread across the four frames, so frame 4 leads straight back into frame 1."""
    return [
        fireball(phase=0.0),
        fireball(phase=math.pi / 2),
        fireball(phase=math.pi),
        fireball(phase=3 * math.pi / 2),
    ]


def shatter(source: Canvas, spread: int, drop: set[int]) -> Canvas:
    """Break the carve into blocks and push each one outwards.

    The defeat is a shatter and not a fade because opacity is forbidden, so the
    disappearance has to be carried by the line itself coming apart. Blocks of 5 px keep
    each fragment large enough to still read as a piece of burning woodcut rather than
    as dust.
    """
    out = Canvas(SIZE, SIZE)
    block = 5
    for y in range(SIZE):
        for x in range(SIZE):
            pixel = source.pixels[y][x]
            if pixel[3] == 0:
                continue
            bx, by = x // block, y // block
            if (bx * 5 + by * 3) % 11 in drop:
                continue
            dx = (bx * block + block / 2) - CX
            dy = (by * block + block / 2) - CY
            norm = max(abs(dx), abs(dy), 1.0)
            tx = x + round(dx / norm * spread)
            ty = y + round(dy / norm * spread)
            if 1 <= tx < SIZE - 1 and 1 <= ty < SIZE - 1:
                out.pixels[ty][tx] = pixel
    out.outline(OUTLINE)
    return out


def crack(canvas: Canvas, segments: tuple[tuple[int, int, int, int], ...]) -> Canvas:
    """Split the carve along straight lines, clipped to the flame.

    Clipping matters: a line drawn straight onto the canvas would keep going past the
    silhouette and leave a stray stroke floating in the transparent margin, which then
    gets its own outline and reads as debris that was never part of the sprite.
    """
    scratch = Canvas(SIZE, SIZE)
    for x0, y0, x1, y1 in segments:
        scratch.line(x0, y0, x1, y1, OUTLINE)
    out = canvas.copy()
    for y in range(SIZE):
        for x in range(SIZE):
            if scratch.pixels[y][x][3] != 0 and canvas.pixels[y][x][3] != 0:
                out.px(x, y, OUTLINE)
    return out


def defeat_frames() -> list[Canvas]:
    # A tighter flame than the loop frames: fragments flying outwards from a 26 px tail
    # would leave the canvas and lose their outline, and a flame that balls up before it
    # bursts reads better anyway.
    collapsing = fireball(phase=math.pi / 4, trail=0.15)
    # Frame 1 is the hit itself: the carve splits across the head but nothing has moved
    # yet, which is what makes a three-frame shatter legible.
    cracked = crack(collapsing, ((31, 21, 49, 42), (31, 42, 49, 21), (27, 32, 53, 31)))
    return [
        cracked,
        shatter(collapsing, spread=4, drop={3}),
        shatter(collapsing, spread=9, drop={0, 2, 3, 5, 7, 8, 10}),
    ]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, default=Path("src/assets/sprites/fireball"))
    args = parser.parse_args()

    for action, frames in (("move", move_frames()), ("defeat", defeat_frames())):
        for path, frame in zip(save_frames(frames, args.out, "fireball", action), frames):
            print(f"{path.name}  tones={frame.tones()}")
            print(frame.preview())
            print()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
