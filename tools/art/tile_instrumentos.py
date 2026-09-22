#!/usr/bin/env python3
"""Draws the Phase 1 (instrumentos) ground tiles: top, mid, left and right.

The catalog's minimum set for a theme. `top` is the walkable surface, `mid` the earth
under it, and `left`/`right` the two ends of a ledge, where the surface meets a hole or
the end of a floating platform. Any run of ground or any platform length assembles from
these four without stretching.

Tiles are the one asset carved *inwards* (`asset-catalog.md`, scenery tiles): an outer
outline would show as a seam every 64 px. So the zinc-950 carve lives on the top row of
`top`, and on the top row plus the outer column of `left` and `right`. Everything that
reaches a tile edge — the hatching and the edge profile — has a period that divides
64, so a row of tiles reads as one continuous strip.

The earth is the sertão's cracked ground from the shared iconography repertoire
(`asset-catalog.md`, parallax layers): a flat zinc-800 mass with a few zinc-700 chips,
split by zinc-950 cracks that carry a zinc-700 lip, like a cut in the block. The cracks
stay away from the tile border so they never end abruptly at a seam. Light comes from
above: the surface band right under the carve is the lighter zinc-700 hatched with
zinc-800, and the body below it is darker.

Three tones per tile: zinc-950 carve and cracks, zinc-800 earth, zinc-700 light. All in
the playable band zinc-700..950 (`art-contrast-readability.md`).

    python3 tools/art/tile_instrumentos.py --out src/assets/sprites/tiles/instrumentos
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, ".agents/skills/design-asset/scripts")
from pixelpng import Canvas  # noqa: E402

SIZE = 64  # scenery tile, per `art-grid-and-scale.md`

CARVE = "zinc-950"
EARTH = "zinc-800"
LIGHT = "zinc-700"

# Depth of the top carve per column: 3 px everywhere, with a few chisel bites of 4–5 px.
# First and last values match so the edge runs on across the seam.
TOP_BITES = {5: 4, 6: 5, 7: 4, 22: 4, 23: 4, 38: 4, 39: 5, 40: 5, 41: 4, 55: 4}
SURFACE_BAND = 9  # rows of lit surface under the carve

# Same idea for the outer column of the ledge ends, indexed by row.
SIDE_BITES = {14: 4, 15: 4, 30: 4, 31: 5, 32: 4, 47: 4, 48: 4}
SIDE_DEPTH = 3

# Cracks as polylines, kept at least 6 px inside the tile so none ends at a seam.
CRACKS_MID = [
    [(9, 12), (14, 17), (13, 24), (19, 29), (26, 30)],
    [(19, 29), (18, 36)],
    [(44, 8), (41, 14), (46, 21)],
    [(34, 44), (39, 47), (38, 53), (45, 57)],
    [(52, 34), (56, 40)],
]
CRACKS_UNDER_SURFACE = [
    [(10, 26), (15, 31), (14, 38), (21, 43), (27, 43)],
    [(47, 24), (43, 31), (48, 37), (47, 44)],
    [(33, 51), (38, 55), (44, 56)],
]
# Pebbles: small lit chips, placed by hand so the repeat does not read as a grid.
PEBBLES_MID = [(28, 10, 3, 2), (6, 40, 2, 2), (50, 50, 3, 2), (24, 55, 2, 2), (55, 19, 2, 2), (30, 36, 2, 1)]
PEBBLES_UNDER_SURFACE = [(30, 25, 3, 2), (7, 50, 2, 2), (54, 50, 3, 2), (22, 58, 2, 1)]


def earth(pebbles: list[tuple[int, int, int, int]]) -> Canvas:
    canvas = Canvas(SIZE, SIZE)
    canvas.rect(0, 0, SIZE, SIZE, EARTH)
    for x, y, w, h in pebbles:
        canvas.rect(x, y, w, h, LIGHT)
    return canvas


def draw_cracks(canvas: Canvas, cracks: list[list[tuple[int, int]]]) -> None:
    for crack in cracks:
        for (x0, y0), (x1, y1) in zip(crack, crack[1:]):
            # Lit lip one pixel below the cut: the crack reads as engraved, not drawn.
            canvas.line(x0, y0 + 1, x1, y1 + 1, LIGHT)
    for crack in cracks:
        for (x0, y0), (x1, y1) in zip(crack, crack[1:]):
            canvas.line(x0, y0, x1, y1, CARVE)


def carve_top(canvas: Canvas) -> None:
    for x in range(SIZE):
        depth = TOP_BITES.get(x, 3)
        canvas.rect(x, 0, 1, depth, CARVE)
        # Lit surface: zinc-700 hatched with zinc-800 strokes, spacing 4 so it tiles.
        canvas.rect(x, depth, 1, SURFACE_BAND, LIGHT)
    canvas.hatch(0, 0, SIZE, 3 + SURFACE_BAND + 2, EARTH, spacing=4)
    for x in range(SIZE):
        depth = TOP_BITES.get(x, 3)
        canvas.rect(x, 0, 1, depth, CARVE)


def carve_side(canvas: Canvas, outer_x: int, inward: int) -> None:
    # Deep at the top, tapering to nothing on the bottom row, so the plain `mid` tile
    # underneath continues the ledge without a step.
    for y in range(SIZE):
        full = SIDE_BITES.get(y, SIDE_DEPTH)
        depth = round(full * (SIZE - 1 - y) / (SIZE - 1))
        for step in range(depth):
            canvas.px(outer_x + step * inward, y, CARVE)


def build_mid() -> Canvas:
    canvas = earth(PEBBLES_MID)
    draw_cracks(canvas, CRACKS_MID)
    return canvas


def build_top() -> Canvas:
    canvas = earth(PEBBLES_UNDER_SURFACE)
    draw_cracks(canvas, CRACKS_UNDER_SURFACE)
    carve_top(canvas)
    return canvas


def build_left() -> Canvas:
    canvas = build_top()
    carve_side(canvas, 0, 1)
    return canvas


def build_right() -> Canvas:
    # Drawn, not mirrored: the light still comes from the same side on both ends.
    canvas = build_top()
    carve_side(canvas, SIZE - 1, -1)
    return canvas


def tiled_preview(tiles: list[Canvas]) -> str:
    rows = [tile.preview().splitlines() for tile in tiles]
    return "\n".join("".join(parts) for parts in zip(*rows))


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--out", type=Path, default=Path("src/assets/sprites/tiles/instrumentos"))
    args = parser.parse_args()

    tiles = {
        "tile_instrumentos_top": build_top(),
        "tile_instrumentos_mid": build_mid(),
        "tile_instrumentos_left": build_left(),
        "tile_instrumentos_right": build_right(),
    }
    for name, canvas in tiles.items():
        path = canvas.save(args.out / f"{name}.png")
        print(f"{name}  tones={canvas.tones()}  saved {path}")

    top, mid, left, right = tiles.values()
    print("\nledge: left + top + top + right, earth below")
    print(tiled_preview([left, top, top, right]))
    print(tiled_preview([mid, mid, mid, mid]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
