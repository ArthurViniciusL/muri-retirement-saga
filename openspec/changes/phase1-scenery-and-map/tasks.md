## 1. Rules and documentation

- [x] 1.1 (game-artist) Create `.agents/rules/art-scenery-asset-exception.md` listing the exact files exempt from `art-palette-cordel.md`, `art-contrast-readability.md` and the tonal column of `ui-parallax.md`, plus the temporary debug colours; edit `.agents/rules/art-asset-naming.md` for single-frame scenery props and the ban on upscale suffixes
- [x] 1.2 (game-designer) Create `.agents/rules/gameplay-scenery-obstacles.md` with the hurt/block/decoration classification and the 128 px height ceiling; edit `.agents/rules/code-game-config.md` for the new blocks and `jumpVelocity: -840`
- [x] 1.3 (dev) Edit `.agents/rules/code-phase-config.md` for the new `scenery`, `decoration` and `parallax` fields and the `obstacles` object layer; edit `.agents/rules/architecture-scene-structure.md` to name `PhaseScene` as a non-registered base class; edit `.agents/rules/ui-virtual-controls.md` for keyboard on desktop
- [x] 1.4 (level-designer) Edit `.agents/rules/content-level-design.md` with the Phase 1 baseline layout and this milestone's temporary deviations; delete `openspec/changes/phase1-movement-foundation/`

## 2. Assets

- [x] 2.1 (game-artist) Rename the scenery PNGs to the naming rule, keeping the smallest upscale variant, and write the framing table (original size, target size, factor) to `.agents/docs/scenery-assets.md`

## 3. Configuration

- [x] 3.1 (dev) Extend `src/config/gameConfig.ts` with `debug`, the new `physics` values, `player`, `controls` and `scenery`; verify `yarn build`
- [x] 3.2 (dev) Write `src/config/phasesConfig.ts` with `PhaseConfig` and the `phase1` entry; verify `yarn build`

## 4. Map

- [x] 4.1 (level-designer) Write `tools/level/phase1.py`, generate `src/assets/tilemaps/phase1.json`, and read its validation report: 60×18 tiles, hole widths and run-ups, tallest obstacle ≤ 128 px, no ceiling below 2 tiles

## 5. Systems and entities

- [x] 5.1 (dev) `SceneryAssets.ts` (imports, keys, preload, framing) and `PhaseTileset.ts` (eight tiles sliced into a canvas texture); load both in `PreloadScene`
- [x] 5.2 (dev) `ControlTextures.ts`, the ported `VirtualControls.ts` and `InputController.ts` merging keyboard and touch
- [x] 5.3 (dev) `DebugTextures.ts`, `PlayerStateMachine.ts` and `Player.ts` with coyote time, jump buffer and jump cut
- [x] 5.4 (dev) `Obstacle.ts`, `Coin.ts`, `HealthSystem.ts`, `CurrencySystem.ts` and `PhaseDecorator.ts`
- [x] 5.5 (ui-ux-designer, dev) `src/data/debugText.ts` and `src/ui/DebugOverlay.ts` at the top-left corner, bitmap font only

## 6. Scene

- [x] 6.1 (dev) `PhaseScene.ts` with map, parallax, decoration, objects, physics, camera and UI, and `Phase1Scene.ts` as a three-line subclass

## 7. Verification

- [x] 7.1 (dev) `yarn build` and `yarn lint` pass
