## Why

Reaching zero hearts does nothing today: `HealthSystem` stops at 0, the phase keeps
running and `GameOverScene.ts` holds only a comment. Falling below the world silently
calls `scene.restart()`, which reads as a crash. The failure loop of the whole game is
missing, and `.agents/rules/gameplay-health.md` already dictates what it must be.

## What Changes

- Losing the fifth heart ends the run: the damage shake already fires, the world freezes
  with `physics.pause()`, input is ignored, and after a death beat of 800 ms the game
  goes to `GameOverScene`.
- Muri gains the terminal state `Dead` in `PlayerStateMachine`, reachable from any state,
  leaving to none. `Hurt` stays out of this change.
- Falling below the world is a death with no beat: it replaces the silent
  `scene.restart()` and goes straight to `GameOverScene`.
- New `GameOverScene`, registered in `src/main.ts`: full `ink` background, stamp intro
  honouring `Motion.isReduced()`, and one primary `SeraButton` that restarts the phase
  the guest died in. Enter and Space activate it. A viewport change relays out through
  `scene.restart` while keeping the phase.
- Restart is the phase from the beginning: five hearts, zero coins, puzzle to solve
  again. No checkpoint, no lives, no continues.

## Non-goals

No death or game-over SFX (no SFX is implemented yet). No `Hurt` state, no i-frames, no
knockback. No second button out to the phase select screen. No persistence of coins or
puzzle progress across attempts.

## Capabilities

### New Capabilities

- `player-death`: what happens between the last heart and the game-over screen — the
  `Dead` state, the frozen beat, falling below the world, and what the restart resets.
- `game-over`: the game-over screen — layout, copy, the single restart action, keyboard
  support, motion and resize behaviour.

### Modified Capabilities

None. `openspec/specs/` has no published capabilities yet.

## Impact

- Rules: `gameplay-player-state-machine.md` (add `Dead`), `gameplay-health.md` (death
  beat, fall as death), `content-open-decisions.md` (800 ms baseline), plus a new
  `ui-game-over-screen.md`.
- Code: `src/scenes/GameOverScene.ts`, `src/scenes/PhaseScene.ts`,
  `src/systems/PlayerStateMachine.ts`, `src/config/gameConfig.ts`, `src/main.ts`, new
  `src/data/gameOverText.ts`.
- No new dependency, no persistence, no network. Scene count stays at the ten
  `architecture-scene-structure.md` already lists.

## Open questions for the owner

None: Q1–Q21 of the grilling session settled scope, copy, the beat value and the
process.
