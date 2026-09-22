---
title: Scenery Asset Exception
impact: HIGH
impactDescription: the only artwork allowed outside the Cordel Arcade palette
tags: art, assets, palette, scenery
---

## Scenery Asset Exception

The owner authorised one named exception: the Phase 1 scenery artwork ships with its own
colours, unchanged. For the files listed below, and only for them, this rule supersedes
`art-palette-cordel.md`, `art-contrast-readability.md` and the tonal column of
`ui-parallax.md`. Everything else — HUD, UI, characters, enemies, puzzle cards, control
buttons — stays on the six Cordel tokens.

The exception exists because the artwork already exists and the party date does not
move. It is a scope decision, not a style change, so it is written down instead of being
broken silently.

**Covered files**, under `src/assets/sprites/`:

```
ground/brick_wall.png      ground/wooden_wall.png     ground/bricks.png
decoration/foliage.png     decoration/fluffy_cloud.png
obstacles/cactus.png       obstacles/cactus_red.png   obstacles/campfire.png
obstacles/rock_formation.png  obstacles/stone_rock.png  obstacles/pebble.png
obstacles/wooden_barrel.png   obstacles/woodlog.png     obstacles/fox_car.png
coins/coin_spin_01.png     coins/coin_spin_02.png
```

No file joins this list without the owner. A new scenery asset is drawn in the palette.

**Debug placeholders** are covered too, and are temporary. While
`gameConfig.debug.enabled` is on, the player is a flat rectangle: green when idle,
walking forward or airborne, blue when moving left, red when crouched. Those three
colours are outside the palette on purpose, live under `debug_*` texture keys, and are
deleted together with the flag when Muri's art lands.

What the exception does **not** suspend: the 64 px grid (`art-grid-and-scale.md`), the
naming rule (`art-asset-naming.md`), and the ban on gradients, glow and opacity effects.
Framed sizes are recorded in `.agents/docs/scenery-assets.md`.

Reference: `.agents/docs/guidelines.md` §6, §9, §14
