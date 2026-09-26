# Scenery assets: source files and framing

The Phase 1 scenery artwork is third-party pixel art used with its own colours, under
the named exception in `.agents/rules/art-scenery-asset-exception.md`. None of it was
authored on the 64 px grid, so every image is framed at runtime to a size that fits the
grid. This file records what each file is and what it is drawn at; the numbers in code
live in `gameConfig.scenery.targets`.

## Shared geometry

Every file is a single sprite, not a sheet. The owner trimmed the transparent padding
the original files carried, so the artwork now touches all four edges: the empty margin
was distorting how big each prop looked once framed. What is left is an upscale factor
`k` and an ink outline of `1 × k` px around the artwork. That regularity is what makes
the framing table and the tile slicing mechanical instead of hand-measured. `coin_spin_*`
is the one file set that still has its 4 px margin.

## Framing modes

- **Stretch** — tiles only. The sliced region is drawn into a 64×64 cell. The aspect
  ratio changes, which is invisible on a brick or plank pattern, and is deliberate.
- **Contain** — props and coins. One factor, `min(boxW / fileW, boxH / fileH)`, so the
  art keeps its proportions inside a box whose sides are multiples of 64.

## Table

| Key | File | File px | `k` | Mode | Box | Factor | Drawn at |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `brick_wall` | `ground/brick_wall.png` | 224×144 | 8 | stretch | 64×64 per tile | — | 64×64 |
| `wooden_wall` | `ground/wooden_wall.png` | 336×240 | 12 | stretch | 64×64 per tile | — | 64×64 |
| `bricks` | `ground/bricks.png` | 576×480 | 24 | — | — | — | not used yet |
| `cactus` | `obstacles/cactus.png` | 384×480 | 12 | contain | 96×96 | 0.2000 | 77×96 |
| `cactus_red` | `obstacles/cactus_red.png` | 768×960 | 24 | contain | 96×96 | 0.1000 | 77×96 |
| `campfire` | `obstacles/campfire.png` | 552×720 | 24 | contain | 96×96 | 0.1333 | 74×96 |
| `rock_formation` | `obstacles/rock_formation.png` | 624×544 | 8 | contain | 128×64 | 0.1176 | 73×64 |
| `stone_rock` | `obstacles/stone_rock.png` | 288×304 | 8 | contain | 64×64 | 0.2105 | 61×64 |
| `wooden_barrel` | `obstacles/wooden_barrel.png` | 92×116 | 4 | contain | 64×64 | 0.5517 | 51×64 |
| `woodlog` | `obstacles/woodlog.png` | 360×216 | 12 | contain | 128×64 | 0.2963 | 107×64 |
| `pebble` | `obstacles/pebble.png` | 280×208 | 8 | contain | 64×64 | 0.2286 | 64×48 |
| `fox_car` | `obstacles/fox_car.png` | 872×597 | — | contain | 192×96 | 0.1608 | 140×96 |
| `foliage` | `decoration/foliage.png` | 584×480 | 8 | contain | 64×40 | 0.0833 | 49×40 |
| `fluffy_cloud` | `decoration/fluffy_cloud.png` | 208×128 | 8 | contain | 128×96 | 0.6154 | 128×79 |
| `ui_heart_full/half/empty` | `heart/ui_heart_*.png` | 33×31 | — | contain | 32×30 | 0.9697 | 32×30 |
| `coin_spin_01/02` | `coins/coin_spin_01.png`, `_02.png` | 34×34 | 1 | contain | 32×32 | 0.9412 | 32×32 |

Every obstacle that hurts is drawn at 96 px tall or less and every obstacle that only
blocks at 64 px, except the green cactus and the car, which are 96 px, which are the ceilings in `gameplay-scenery-obstacles.md`. The cap comes
from how long the jump keeps the player above the obstacle, not from how high the jump
peaks: above 96 px the player travels 147 px, above 128 px only 121 px.

## Files kept but not shipped

`src/assets/sprites/unused/` holds the larger upscale variants of the same artwork. They
are there as a source for a future redraw and are never imported. Out of scope for now,
and therefore untouched: `brew/` and `Medkit_8x.png`.

`pebble` moved from decoration to a blocking obstacle and `fox_car` joined the obstacles, so
the only decoration left is `foliage` on the ground and `fluffy_cloud` in the far layer.
`foliage` is placed in threes at the foot of each cactus, never alone.
The cloud box shrank from 256×192 to 128×96: at the old size the clouds read as
foreground instead of sky.

## What replaces this

When the game artist redraws the scenery in the Cordel Arcade palette, each new file is
authored at its "Drawn at" size, the exception rule loses that file, and its row here is
deleted. The `gameConfig.scenery.targets` entry stays, so no scene changes.
