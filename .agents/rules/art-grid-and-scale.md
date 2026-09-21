---
title: The 64 px Grid Is Locked
impact: HIGH
impactDescription: keeps proportion between character, enemies, scenery and UI
tags: art, grid, scale
---

## The 64 px Grid Is Locked

`guidelines.md` §4 left the grid open between 32 and 64 and warned that mixing scales
breaks proportion. It is now locked at **64×64 px**. This rule supersedes that open
range.

| Element | Size |
| --- | --- |
| Entity sprite (enemies, thieves) | 64×64 |
| Muri | 64×96 (one tile wide, one and a half tall) |
| Scenery tile | 64×64 |
| HUD icon (heart, ammo, coin) | 32 |
| Puzzle card | authored 64, displayed 96 |
| Virtual control button | 128 |

Every size is a multiple or a clean fraction of 64. Broken values such as 20, 48 or 100
are forbidden: the tilemap must assemble without resampling.

**Incorrect:** a 48×48 heart icon, a 32×32 bat next to a 64×64 wild cat, a tileset
exported at 32 px and scaled up in code.

**Correct:** everything drawn on the 64 grid, scaled only at display time by the rules
in `art-pseudo-pixel-art.md`.

Reference: `.agents/docs/guidelines.md` §4, §7, §8
