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

Reference: `.agents/docs/guidelines.md` §1; `.agents/docs/system-design.md` §18
