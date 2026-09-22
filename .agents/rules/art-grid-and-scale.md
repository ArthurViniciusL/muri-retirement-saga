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
| Muri | displayed 144 px tall (≈96×144) — see the exception below |
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

### Exception: Muri is shown from the owner's drawings

Decided by the project owner: Muri is not authored on the grid. The game loads the
owner's original drawings (`src/assets/sprites/muri/<folder>/NNN.png` or `.jpg`, walk frames 247 px
tall, full greyscale, soft edges) and scales them down at display time so a walk frame is
144 px tall (`gameConfig.player.displayHeight`), with linear filtering. The zinc palette,
tone limit, outline and "no mixed resolutions" rules do not apply to these frames. The
background sun (`src/assets/sprites/sun.png`, a 302×300 drawing shown at 112–176 px,
spinning and pulsing) and the owner's cacti (`cactus_001.png` 54×64, `cactus_002.png`
77×77, shown at 1.5×) are the same kind of exception. Every other asset — tiles, enemies,
thieves, HUD, cards, Muri's projectile — stays on the grid.

Muri's physics was scaled 1.5× with him (body, speed, jump, gravity), so the jump peaks
at about 216 px instead of 144.

Reference: `.agents/docs/guidelines.md` §4, §7, §8
