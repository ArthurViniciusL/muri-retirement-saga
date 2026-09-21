---
title: Memory Puzzle — 5x5, Three Pairs, Two Minutes, Endless Retry
impact: HIGH
impactDescription: gates progression between phases without ever blocking a guest
tags: gameplay, puzzle, ui
---

## Memory Puzzle — 5x5, Three Pairs, Two Minutes, Endless Retry

Each phase ends with a memory minigame in `PuzzleScene`, themed by
`PhaseConfig.puzzleThemeKey`: instruments in Phase 1, Xbox games in Phase 2, coins in
Phase 3.

- Grid of 25 cards, 5 by 5.
- Goal: match at least **three pairs** within **two minutes**.
- On failure or timeout the puzzle reshuffles and restarts, in a loop, until the player
  succeeds. There is **no** heart penalty and no way to lose the run here — the puzzle
  is independent of `HealthSystem`.
- Completing it grants the phase's essential item and unlocks the next phase.
- The trigger is a fixed collision zone in the tilemap (`PhaseConfig.puzzleTriggerZone`,
  an altar or stall), placed near the end of the route.

Layout on a 576 px logical height: cards are authored at 64×64 px and **displayed at
96 px** (1.5×), giving a 480×480 grid, centred. The touch target is the whole cell
including its spacing, never just the card sprite. The 48×48 minimum suggested in
`guidelines.md` §8 is not a valid multiple of the locked 64 grid; 64 authored at 96
displayed replaces it.

**Incorrect:**

```ts
if (this.timedOut) {
  this.health.loseHeart();       // the puzzle never costs health
  this.scene.start('GameOverScene');
}
```

**Correct:**

```ts
if (this.timedOut) {
  this.shuffle();                // loop until the player gets three pairs
  this.restartTimer();
}
```

Reference: `.agents/docs/system-design.md` §11, §12; `.agents/docs/guidelines.md` §8
