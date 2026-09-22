"""Generates src/assets/tilemaps/phase1.json from the ASCII layout below.

The script is the source of truth for the Phase 1 route: edit the layout, run the
script, commit both. It also prints a validation report that stands in for a playtest
(hole widths, run-ups, tallest obstacle, ceiling clearance).

Usage:
    python3 tools/level/phase1.py [--out src/assets/tilemaps/phase1.json]
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

TILE = 64
WIDTH = 60
HEIGHT = 18

# Ground family ids 0-3, platform family ids 4-7: top, middle, left corner, right corner.
GROUND, PLATFORM = 0, 4
TOP, MID, LEFT, RIGHT = 0, 1, 2, 3
FIRST_GID = 1

# Legend: '#' ground, '=' platform, '.' empty, 'P' spawn, 'o' coin, letters = obstacles.
OBSTACLES = {
    'c': 'cactus',
    'C': 'cactus_red',
    'f': 'campfire',
    'r': 'rock_formation',
    's': 'stone_rock',
    'b': 'wooden_barrel',
    'w': 'woodlog',
    'p': 'pebble',
    'x': 'fox_car',
}

# Display height of every obstacle, from .agents/docs/scenery-assets.md.
OBSTACLE_HEIGHT = {
    'cactus': 96,
    'cactus_red': 96,
    'campfire': 96,
    'rock_formation': 64,
    'stone_rock': 64,
    'wooden_barrel': 64,
    'woodlog': 64,
    'pebble': 48,
    'fox_car': 96,
}

MAX_OBSTACLE_HEIGHT = 96
MIN_CEILING_TILES = 2
MIN_RUN_UP_TILES = 4
# A full jump covers about 3.2 tiles, so six tiles give the player a jump plus as much
# ground again to land, read the next threat and line the next jump up: about 1.7 s at
# walking speed.
MIN_OBSTACLE_GAP_TILES = 6
# The opening stretch teaches the controls, so it carries no obstacle at all.
SAFE_START_TILES = 10
# A jump over a hole lands about three tiles past its edge; an obstacle there is a trap
# the player cannot read in time.
LANDING_CLEAR_TILES = 4

LAYOUT = [
    '............................................................',
    '............................................................',
    '............................................................',
    '......................................o.....................',
    '.....................................===....................',
    '.................................o..........................',
    '................................====........................',
    '.............................o..............................',
    '............................===.............................',
    '.........................o..................................',
    '........................===.................................',
    '.....................o......................................',
    '....................===.....................................',
    '............................................................',
    '..Po.o...oo.....###.s..o..c..o..r..o..c..o..C..o..o.......xo',
    '############..######################################..######',
    '############..######################################..######',
    '############..######################################..######',
]


def solid(grid: list[str], row: int, col: int) -> bool:
    if row < 0 or row >= HEIGHT or col < 0 or col >= WIDTH:
        return False
    return grid[row][col] in '#='


def tile_id(grid: list[str], row: int, col: int) -> int:
    family = GROUND if grid[row][col] == '#' else PLATFORM
    open_above = not solid(grid, row - 1, col)
    if not open_above:
        return family + MID
    if not solid(grid, row, col - 1):
        return family + LEFT
    if not solid(grid, row, col + 1):
        return family + RIGHT
    return family + TOP


def surface_rows(grid: list[str]) -> dict[int, int]:
    """Topmost solid row per column, i.e. the walking surface."""
    surfaces: dict[int, int] = {}
    for col in range(WIDTH):
        for row in range(HEIGHT):
            if grid[row][col] == '#':
                surfaces[col] = row
                break
    return surfaces


def build_tile_layer(grid: list[str]) -> list[int]:
    data: list[int] = []
    for row in range(HEIGHT):
        for col in range(WIDTH):
            if solid(grid, row, col):
                data.append(tile_id(grid, row, col) + FIRST_GID)
            else:
                data.append(0)
    return data


def object_layers(grid: list[str]) -> tuple[list[dict], list[dict], dict]:
    obstacles: list[dict] = []
    coins: list[dict] = []
    spawn: dict = {}
    next_id = 1
    for row in range(HEIGHT):
        for col in range(WIDTH):
            char = grid[row][col]
            if char in '.#=':
                continue
            # Objects hang from the surface right below them and are anchored at the feet.
            x = col * TILE + TILE // 2
            y = (row + 1) * TILE
            if char == 'P':
                spawn = {'x': x, 'y': y}
            elif char == 'o':
                coins.append(
                    {
                        'id': next_id,
                        'name': 'coin',
                        'type': 'coin',
                        'point': True,
                        'x': x,
                        'y': y - TILE // 2,
                        'width': 0,
                        'height': 0,
                        'visible': True,
                        'rotation': 0,
                    }
                )
                next_id += 1
            elif char in OBSTACLES:
                obstacles.append(
                    {
                        'id': next_id,
                        'name': OBSTACLES[char],
                        'type': OBSTACLES[char],
                        'point': True,
                        'x': x,
                        'y': y,
                        'width': 0,
                        'height': 0,
                        'visible': True,
                        'rotation': 0,
                    }
                )
                next_id += 1
    return obstacles, coins, spawn


def build_map(grid: list[str]) -> dict:
    obstacles, coins, _ = object_layers(grid)
    return {
        'compressionlevel': -1,
        'height': HEIGHT,
        'infinite': False,
        'layers': [
            {
                'data': build_tile_layer(grid),
                'height': HEIGHT,
                'id': 1,
                'name': 'ground',
                'opacity': 1,
                'type': 'tilelayer',
                'visible': True,
                'width': WIDTH,
                'x': 0,
                'y': 0,
            },
            {
                'draworder': 'topdown',
                'id': 2,
                'name': 'obstacles',
                'objects': obstacles,
                'opacity': 1,
                'type': 'objectgroup',
                'visible': True,
                'x': 0,
                'y': 0,
            },
            {
                'draworder': 'topdown',
                'id': 3,
                'name': 'coins',
                'objects': coins,
                'opacity': 1,
                'type': 'objectgroup',
                'visible': True,
                'x': 0,
                'y': 0,
            },
        ],
        'nextlayerid': 4,
        'nextobjectid': len(obstacles) + len(coins) + 1,
        'orientation': 'orthogonal',
        'renderorder': 'right-down',
        'tiledversion': '1.10.2',
        'tileheight': TILE,
        'tilesets': [
            {
                'columns': 8,
                'firstgid': FIRST_GID,
                # Bound at runtime to the canvas texture built by PhaseTileset; this file
                # is never fetched.
                'image': 'tiles_phase1.png',
                'imageheight': TILE,
                'imagewidth': TILE * 8,
                'margin': 0,
                'name': 'tiles',
                'spacing': 0,
                'tilecount': 8,
                'tileheight': TILE,
                # Every tile collides; the layer reads collision from this property.
                'tiles': [
                    {'id': index, 'properties': [{'name': 'collides', 'type': 'bool', 'value': True}]}
                    for index in range(8)
                ],
                'tilewidth': TILE,
            }
        ],
        'tilewidth': TILE,
        'type': 'map',
        'version': '1.10',
        'width': WIDTH,
    }


def holes(grid: list[str]) -> list[tuple[int, int]]:
    found: list[tuple[int, int]] = []
    start: int | None = None
    for col in range(WIDTH):
        empty = grid[HEIGHT - 1][col] not in '#='
        if empty and start is None:
            start = col
        elif not empty and start is not None:
            found.append((start, col - 1))
            start = None
    if start is not None:
        found.append((start, WIDTH - 1))
    return found


def report(grid: list[str]) -> list[str]:
    obstacles, coins, spawn = object_layers(grid)
    surfaces = surface_rows(grid)
    lines = [
        f'map: {WIDTH}x{HEIGHT} tiles = {WIDTH * TILE}x{HEIGHT * TILE} px',
        f'spawn: x={spawn.get("x")} y={spawn.get("y")}',
        f'coins: {len(coins)}',
        f'obstacles: {len(obstacles)}',
    ]

    for start, end in holes(grid):
        run_up = 0
        col = start - 1
        while col >= 0 and col in surfaces:
            run_up += 1
            col -= 1
        lines.append(
            f'hole cols {start}-{end}: width {end - start + 1} tiles, run-up {run_up} tiles'
            + ('' if run_up >= MIN_RUN_UP_TILES else '  <-- SHORT RUN-UP')
        )

    columns = sorted(obstacle['x'] // TILE for obstacle in obstacles)
    first = columns[0] if columns else WIDTH
    lines.append(
        f'first obstacle at column {first}'
        + ('' if first >= SAFE_START_TILES else f'  <-- INSIDE THE SAFE START ({SAFE_START_TILES} tiles)')
    )
    tight = [
        (left, right)
        for left, right in zip(columns, columns[1:])
        if right - left < MIN_OBSTACLE_GAP_TILES
    ]
    lines.append(
        f'closest obstacles: {min((r - l for l, r in zip(columns, columns[1:])), default=0)} tiles apart'
        + ('' if not tight else f'  <-- TOO CLOSE: {tight}')
    )

    for start, end in holes(grid):
        trapped = [column for column in columns if end < column <= end + LANDING_CLEAR_TILES]
        if trapped:
            lines.append(f'hole cols {start}-{end}: obstacle at {trapped} ON THE LANDING <-- TRAP')
    lines.append(f'landing clearance after every hole: {LANDING_CLEAR_TILES} tiles required')

    tallest = max((OBSTACLE_HEIGHT[o['type']] for o in obstacles), default=0)
    lines.append(
        f'tallest obstacle: {tallest} px'
        + ('' if tallest <= MAX_OBSTACLE_HEIGHT else '  <-- ABOVE THE CEILING')
    )

    worst = HEIGHT
    worst_col = -1
    for col, row in surfaces.items():
        clear = 0
        probe = row - 1
        while probe >= 0 and not solid(grid, probe, col):
            clear += 1
            probe -= 1
        if clear < worst:
            worst, worst_col = clear, col
    lines.append(
        f'lowest ceiling: {worst} tiles above the surface at column {worst_col}'
        + ('' if worst >= MIN_CEILING_TILES else '  <-- FORCED CROUCH')
    )
    return lines


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', default='src/assets/tilemaps/phase1.json')
    args = parser.parse_args()

    for index, row in enumerate(LAYOUT):
        if len(row) != WIDTH:
            raise SystemExit(f'layout row {index} has {len(row)} columns, expected {WIDTH}')
    if len(LAYOUT) != HEIGHT:
        raise SystemExit(f'layout has {len(LAYOUT)} rows, expected {HEIGHT}')

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(build_map(LAYOUT), indent=1, sort_keys=True) + '\n', encoding='utf-8')

    print(f'wrote {out}')
    for line in report(LAYOUT):
        print(line)


if __name__ == '__main__':
    main()
