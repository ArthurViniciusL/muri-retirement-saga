---
title: Ten Scenes, Puzzle as a Paused Overlay
impact: HIGH
impactDescription: keeps phase state intact across the puzzle minigame
tags: architecture, phaser, scenes
---

## Ten Scenes, Puzzle as a Paused Overlay

The game has exactly ten scenes: `BootScene`, `PreloadScene`, `MenuScene`,
`PhaseSelectScene`, `Phase1Scene`, `Phase2Scene`, `Phase3Scene`, `PuzzleScene`,
`GameOverScene`, `VictoryScene`. Do not add scenes without a rule change.

`PhaseSelectScene` sits between the cover and the phases. "Iniciar" on the cover opens
it, and completing a phase returns to it until all three phases are done; the last
completion goes to `VictoryScene`. Which phases are completed or unlocked lives in
`PhaseProgress`, in memory only.

`PuzzleScene` is an overlay. Launch it with `scene.launch` and pause the active phase
with `scene.pause`. Never use `scene.start`, which destroys the phase and loses the
player's position, collected coins and remaining hearts. When the puzzle ends, the
phase resumes exactly where it stopped.

The three phase scenes share identical logic and differ only by their `PhaseConfig`
entry. Behaviour that exists in one phase and not in another is a bug, unless the
difference comes from configuration data.

That shared logic lives in `PhaseScene`, a base class the three phase scenes extend. It
is never registered in `main.ts` and has no scene key of its own, so the count above
stays at ten.

**Incorrect:**

```ts
// Destroys the running phase; the player restarts the level after the puzzle.
this.scene.start('PuzzleScene', { theme: 'instrumentos' });
```

**Correct:**

```ts
this.scene.pause();
this.scene.launch('PuzzleScene', { theme: this.config.puzzleThemeKey });
```

Reference: `.agents/docs/system-design.md` §3
