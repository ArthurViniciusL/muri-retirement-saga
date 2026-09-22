---
title: Eleven Scenes, Puzzle and Pause as Paused Overlays
impact: HIGH
impactDescription: keeps phase state intact across the puzzle minigame
tags: architecture, phaser, scenes
---

## Eleven Scenes, Puzzle and Pause as Paused Overlays

The game has exactly eleven scenes: `BootScene`, `PreloadScene`, `MenuScene`,
`PhaseSelectScene`, `Phase1Scene`, `Phase2Scene`, `Phase3Scene`, `PuzzleScene`,
`PauseScene`, `GameOverScene`, `VictoryScene`. Do not add scenes without a rule change.

`PhaseScene` is the shared base class of the three phase scenes. It is never
registered as a scene, so it does not count toward the eleven.

`PhaseSelectScene` sits between the cover and the phases. "Iniciar" on the cover opens
it, and completing a phase returns to it until all three phases are done; the last
completion goes to `VictoryScene`. Which phases are completed or unlocked lives in
`PhaseProgress`, in memory only.

`PuzzleScene` is an overlay. Launch it with `scene.launch` and pause the active phase
with `scene.pause`. Never use `scene.start`, which destroys the phase and loses the
player's position, collected coins and remaining hearts. When the puzzle ends, the
phase resumes exactly where it stopped.

`PauseScene` and `GameOverScene` use the same pattern: the phase pauses itself and
launches the overlay, passing its own scene key. The overlay resumes, restarts or stops
the phase through that key.

The three phase scenes share identical logic and differ only by their `PhaseConfig`
entry. Behaviour that exists in one phase and not in another is a bug, unless the
difference comes from configuration data.

Menu scenes restart themselves on a screen resize to redo their layout. Phase scenes do
not: a restart would lose the run. On resize, a phase resizes its camera and re-anchors
its screen-fixed UI instead.

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
