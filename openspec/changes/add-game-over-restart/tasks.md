## 1. Player death in the phase

- [x] 1.1 (dev) Add `Dead` to `PlayerState` in `src/systems/PlayerStateMachine.ts`: every existing state's transition list gains `Dead`, `Dead: []`; verify `yarn build` passes and a transition out of `Dead` returns `false`
- [x] 1.2 (dev) In `PhaseScene`, store the `PhaseSceneKey` from the constructor and add the private dying guard: `create` resets it, `update` returns early while dying, and `onHazardContact` ignores contacts once dying; verify `yarn build` and `yarn lint` pass
- [x] 1.3 (dev) Trigger the death when `health.remaining` reaches 0 in `onHazardContact`: keep the existing `shakeOnDamage()`, transition the player to `Dead`, `physics.pause()`, `controls.reset()`, then `time.delayedCall(gameConfig.combat.deathBeatMs, …)` starting `GameOverScene` with the stored phase key; verify a second hazard in the same attempt neither loses a heart nor re-arms the timer
- [x] 1.4 (dev) Replace the `player.y > config.worldHeight` `scene.restart()` in `PhaseScene.update` with the same death path minus the beat and the shake: `GameOverScene` starts immediately for the stored phase key; verify the silent restart is gone from the file

## 2. Screen support in the UI kit

- [x] 2.1 (dev) Add the `onDark` option to `SeraButton`: solid face `bone` idle and `sera.muted` hover/pressed, label tone `ink`, everything else unchanged and `variant` untouched; verify `yarn build` passes and `MenuScene` and `PhaseSelectScene` compile with no call-site change
- [x] 2.2 (dev) Register the `dust` tone in `BootScene`'s `PixelFont.register` call alongside `bone` and `ink`; verify `yarn build` passes and `PixelFont.keyFor('dust')` resolves to a registered bitmap font

## 3. The game over scene

- [x] 3.1 (dev) Implement `src/scenes/GameOverScene.ts` per `.agents/rules/ui-game-over-screen.md`: ink background, centred stack of title, support line and the `onDark` `SeraButton`, all strings from `src/data/gameOverText.ts`, scene data `{ phase: PhaseSceneKey; relayout?: boolean }`; verify `yarn build` and `yarn lint` pass
- [x] 3.2 (dev) Add the behaviour copied from `PhaseSelectScene`: stamp intro with the stagger and the closing camera shake, button pulse after the intro, the reduced-motion path through `Motion.isReduced()`, Enter and Space activation, the `leaving` guard against a double press, `UiSound.click` on activation, and the resize restart carrying `{ phase, relayout: true }`; verify the intro is skipped on a relayout
- [x] 3.3 (dev) Register `GameOverScene` in `src/main.ts` after the three phase scenes; verify `yarn build` passes and the scene count still matches `architecture-scene-structure.md`

## 4. Verification

- [x] 4.1 (dev) `yarn build` and `yarn lint` pass
