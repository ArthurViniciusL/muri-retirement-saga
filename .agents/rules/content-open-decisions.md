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

### 1. Shared design system versus the zinc palette

`guidelines.md` §1 flags that the game's monochrome zinc palette diverges from the
three-colour Cordel Arcade palette used by the party invitation. Inside this repository
the zinc palette applies without exception, per `art-palette-zinc.md`. Whether the
shared design system document should adopt the divergence is a decision that lives
outside this codebase and does not block any work here.

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
