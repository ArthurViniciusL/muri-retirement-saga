---
title: Decisions Deliberately Left Open
impact: MEDIUM
impactDescription: stops an agent from inventing a value that was never decided
tags: content, process, tuning
---

## Decisions Deliberately Left Open

These are known gaps, not oversights. An agent that hits one of them must ask or use
the configured placeholder — never invent an answer and never treat its own choice as
settled.

### 1. Palette values and pixel gouge marks

The game follows the invitation's Cordel Arcade palette (`art-palette-cordel.md`). The
invitation still marks its three hex values as pending revalidation by the designer, and
the three mixed tones (`dust`, `clay`, `umber`) and the pixel sizes of gouge marks and
hatching (`guidelines.md` §15, §16) are a baseline translated from the vector guide.
Use them as written; a revalidated value is a one-line change in `palette.ts` and
`pixelpng.py`.

### 2. Gameplay tuning

Open for playtest, per `system-design.md` §18:

- Exact speed, detection range and patrol route of each enemy, within the movement band
  each type already owns.
- Exact count and placement of ranged-ammo pickups per phase.
- Overall difficulty: enemy density and puzzle timing.

All three live in `gameConfig.ts` and `phasesConfig.ts`. The starting physics values in
`code-game-config.md` are a baseline to play against, not a settled balance. Changing
them is expected; changing them at the call site instead of in configuration is not.

### 3. Muri's display size while the art is not on the 64 px grid

The owner authorised shipping the current character art as it is and reframing it later:
the 64 px grid of `art-grid-and-scale.md` stays the final target and today's art is an
accepted transition state. The standing art is 190×550 (ratio 0.35) against the 64×96 the
grid asks for, so `player.artDisplay.standing` (33×96) is a **baseline**: it keeps the
source ratio and anchors the height to the 96 px the physics body already uses, so the
drawing and the hitbox agree about how tall Muri is next to a 96 px obstacle.

It closes when the owner reframes the art. `player.standing` — the hitbox — does **not**
change with it and is not part of this entry.

### 4. Idle animation rate

`player.animations.idle.frameDurationMs` (500 ms, a 1 s cycle) is a **baseline** from
`gameplay-player-idle-animation.md`, pending one playtest at arm's length on a phone.
Faster than this the breath reads as a twitch; much slower and it reads as a frozen
sprite. `frameCount` and `repeat` are locked — they are what the art is.

### 5. Death beat length

`combat.deathBeatMs` (800 ms) is a **baseline** from `gameplay-health.md`, pending one
playtest on a phone: the frozen world has to read as "you died", not as a crash. Shorter
and the game over cuts in before the guest connects it to the last hit; much longer and a
Muri hanging in mid-air starts to look like a bug. The order of the beat — shake, freeze,
game over — and the fact that a fall out of the world has **no** beat are locked, not part
of this entry.

### 6. The thieves are coloured rectangles until their art exists

The owner authorised representing Maryana, Mayra and Weruska as flat rectangles while the
sprites are not ready. They are **placeholders**, not art: red, yellow and green are
outside the Cordel Arcade palette on purpose, so nobody mistakes one for a finished
asset.

| Thief | Phase | Steals | Placeholder |
| --- | --- | --- | --- |
| Maryana | 1 | 5% | green |
| Mayra | 2 | 15% | yellow |
| Weruska | 3 | 30% | red |

The colour reads as severity, lightest theft to heaviest — this mapping is the
**baseline**, the rectangle itself is what the owner settled. Each one is 64×64, the
entity size of `art-grid-and-scale.md`, drawn under the final asset key so swapping in
the sprite is a texture change and nothing else.

It closes when the game artist delivers the three sprites.

Reference: `.agents/docs/guidelines.md` §1; `.agents/docs/system-design.md` §18
