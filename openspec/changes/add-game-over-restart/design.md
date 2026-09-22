## Context

See proposal.md for motivation and `specs/` for the required behaviour.

Current state that shapes the approach:

- `PhaseScene.update` calls `player.step(this.controls.read(), time)` every frame and
  reacts to `player.y > config.worldHeight` with a bare `scene.restart()`.
- `PhaseScene.create` re-instantiates `HealthSystem` and `CurrencySystem`, so restarting
  the scene already resets hearts and coins. `InputController.reset()` already exists.
- `GameOverScene.ts` is a header comment with no class and is not in `main.ts`.
- `PlayerStateMachine` has four states and an explicit transition table.
- `SeraButton` has `default` (solid, `sera.primary` face) and `outline`. `sera.primary`
  is `ink`. `PixelFont.register` is called once in `BootScene` for `bone` and `ink` only.
- No pause control and no `PuzzleScene` exist yet, so the spec requirements about them
  hold vacuously today.

## Goals / Non-Goals

**Goals:** one death path shared by both causes; the frozen beat without a second source
of truth for "dead"; a screen the guest can read on an ink field.

**Non-Goals:** `Hurt`, i-frames, SFX, a pause screen, any change to how hearts are lost.

## Decisions

### 1. `Dead` in the state machine, `dying` guard in the scene

`PlayerState` gains `Dead`; every existing state's transition list gains it and
`Dead: []`. The scene keeps a private boolean that short-circuits `update`, hazard
contacts and the fall check, because the machine answers "what is Muri" and not "has
this scene already armed the death timer". Alternative — reading the machine from the
scene — rejected: `PhaseScene` would query player state to decide flow, and a second
hazard in the same frame could still re-arm the timer.

### 2. `time.delayedCall` for the beat, `physics.pause()` for the freeze

The scene clock keeps running while the Arcade world is paused, so the beat needs no
manual accumulator and no `update` arithmetic. `physics.pause()` freezes every body at
once, including a mid-air Muri who never lands — accepted by the owner over pausing only
velocities. Input stops because `update` returns early; `controls.reset()` is called so
a held button is not re-read.

### 3. The dying phase passes its own scene key

`PhaseScene` stores the `PhaseSceneKey` it was constructed with and starts
`GameOverScene` with `{ phase }`. `PhaseConfig.id` (`'phase1'`) is not a scene key and
gains no new field; `PhaseProgress` is not consulted, so a game over cannot touch
progress.

### 4. `SeraButton` gains `onDark`, orthogonal to `variant`

The face becomes `bone` (idle) / `sera.muted` (hover, pressed) with an `ink` label,
keeping height, padding, press offset and tracking. A boolean beats a third variant: the
variant union mirrors shadcn's variants, and this is a tone context, not a new component.

### 5. `GameOverScene` copies `PhaseSelectScene` wholesale

Same stacking maths, same GSAP stamp timeline, same `{ relayout: true }` resize restart
(carrying `phase` through), same `leaving` guard, `UiSound.click` on activation. The ink
field is `cameras.main.setBackgroundColor`, not a drawn rectangle. `BootScene` registers
`dust` alongside `bone` and `ink` for the support line.

## Risks / Trade-offs

- [A mid-air death reads as a freeze bug for the 800 ms] → owner's decision, and the beat
  is a documented playtest baseline.
- [Falling death has no beat, so two causes feel different] → intended: Muri is already
  off-screen, and a frozen empty screen would be worse.
- [`onDark` is a second axis on `SeraButton`] → one flag, one tone table, no change to the
  existing call sites.
- [Registering a third font tone grows the boot texture] → one canvas strip per tone; the
  cost is a few hundred pixels.

## Migration Plan

No data migration. The pieces ship together: without the scene registered in `main.ts` the
death path would start a missing scene, and without the `onDark` face the only button in
the failure loop would be invisible.
