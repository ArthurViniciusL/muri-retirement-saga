#!/usr/bin/env python3
"""Writes the Phase 1 map as Tiled JSON from the ASCII layout below.

Tiled is not installed yet, so the route is authored here, where it stays readable and
easy to change. The output follows the fields Phaser reads from a Tiled export, so the
file can be opened and refined in Tiled later.

The tileset image does not exist on disk on purpose: the game joins
`tile_instrumentos_{top,mid,left,right}.png` into one strip at runtime and binds the
tileset to it by key. Each solid cell becomes `top` when open above, `left` or `right`
when it is also a ledge end, and `mid` otherwise.

Legend: `#` ground, `=` floating platform (same tiles), `P` player spawn (feet on the tile
below), `c` / `C` cactus_001 / cactus_002 (base on the tile below, object layer `cacti`),
`.` empty.

    python3 tools/level/phase1.py --out src/assets/tilemaps/phase1.json
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

TILE = 64

LAYOUT = [
    "............................................................",
    "............................................................",
    "............................................................",
    "............................................................",
    "............................................................",
    ".............................................=====..........",
    "............................................................",
    ".........................................===................",
    "............................................................",
    ".....................................===....................",
    "............................................................",
    ".................................===........................",
    "............................................................",
    ".............................===............................",
    "..P.........c...........C.................c.......C.........",
    "##################..##################################..####",
    "##################..##################################..####",
    "##################..##################################..####",
]

# Same order as TILE_PARTS in src/systems/ThemeTiles.ts.
TOP, MID, LEFT, RIGHT = 0, 1, 2, 3
TILE_COUNT = 4
FIRST_GID = 1
SOLID = "#="
CACTI = {"c": "cactus_001", "C": "cactus_002"}


def solid(rows: list[str], row: int, col: int) -> bool:
    # Beyond the left and right edges the ground continues, so edge columns stay `top`.
    if col < 0 or col >= len(rows[0]):
        return True
    if row < 0:
        return False
    return rows[row][col] in SOLID


def tile_id(rows: list[str], row: int, col: int) -> int | None:
    if rows[row][col] not in SOLID:
        return None
    if solid(rows, row - 1, col):
        return MID
    open_left = not solid(rows, row, col - 1)
    open_right = not solid(rows, row, col + 1)
    if open_left and not open_right:
        return LEFT
    if open_right and not open_left:
        return RIGHT
    return TOP


def find_spawn(rows: list[str]) -> tuple[int, int]:
    for row, line in enumerate(rows):
        col = line.find("P")
        if col >= 0:
            return col * TILE + TILE // 2, (row + 1) * TILE
    raise ValueError("layout has no P")


def find_cacti(rows: list[str]) -> list[dict]:
    cacti = []
    for row, line in enumerate(rows):
        for col, cell in enumerate(line):
            if cell in CACTI:
                cacti.append({
                    "id": len(cacti) + 1,
                    "name": "",
                    "type": CACTI[cell],
                    "x": col * TILE + TILE // 2,
                    "y": (row + 1) * TILE,
                    "width": 0,
                    "height": 0,
                    "rotation": 0,
                    "point": True,
                    "visible": True,
                })
    return cacti


def build(rows: list[str]) -> dict:
    height = len(rows)
    width = len(rows[0])
    if any(len(line) != width for line in rows):
        raise ValueError("layout rows differ in width")

    data = []
    for row in range(height):
        for col in range(width):
            found = tile_id(rows, row, col)
            data.append(0 if found is None else FIRST_GID + found)

    collides = [{"name": "collides", "type": "bool", "value": True}]
    cacti = find_cacti(rows)
    return {
        "type": "map",
        "version": "1.10",
        "tiledversion": "1.10.2",
        "orientation": "orthogonal",
        "renderorder": "right-down",
        "infinite": False,
        "width": width,
        "height": height,
        "tilewidth": TILE,
        "tileheight": TILE,
        "nextlayerid": 4,
        "nextobjectid": len(cacti) + 1,
        "layers": [
            {
                "id": 1,
                "name": "ground",
                "type": "tilelayer",
                "x": 0,
                "y": 0,
                "width": width,
                "height": height,
                "opacity": 1,
                "visible": True,
                "data": data,
            },
            {
                "id": 2,
                "name": "coins",
                "type": "objectgroup",
                "x": 0,
                "y": 0,
                "opacity": 1,
                "visible": True,
                "draworder": "topdown",
                "objects": [],
            },
            {
                "id": 3,
                "name": "cacti",
                "type": "objectgroup",
                "x": 0,
                "y": 0,
                "opacity": 1,
                "visible": True,
                "draworder": "topdown",
                "objects": cacti,
            },
        ],
        "tilesets": [
            {
                "firstgid": FIRST_GID,
                "name": "tiles",
                "tilewidth": TILE,
                "tileheight": TILE,
                "tilecount": TILE_COUNT,
                "columns": TILE_COUNT,
                "margin": 0,
                "spacing": 0,
                "image": "tiles_instrumentos.png",
                "imagewidth": TILE * TILE_COUNT,
                "imageheight": TILE,
                "tiles": [{"id": i, "properties": collides} for i in range(TILE_COUNT)],
            }
        ],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--out", type=Path, default=Path("src/assets/tilemaps/phase1.json"))
    args = parser.parse_args()

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(build(LAYOUT), indent=1) + "\n")
    x, y = find_spawn(LAYOUT)
    print(f"wrote {args.out} ({len(LAYOUT[0])}x{len(LAYOUT)} tiles)")
    print(f"playerSpawn: {{ x: {x}, y: {y} }}")


if __name__ == "__main__":
    main()
