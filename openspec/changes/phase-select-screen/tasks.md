## 1. Rules and documentation

- [x] 1.1 Update `.agents/rules/architecture-scene-structure.md` to ten scenes, adding `PhaseSelectScene` between `MenuScene` and the phase scenes; verify the file no longer says "nine" and lists all ten scene keys
- [x] 1.2 Update `.agents/docs/system-design.md` §3 (scene table row for `PhaseSelectScene`) and §17 (flow: Menu → Seleção → Fase N → back to Seleção; all three phases completed → Vitória); verify the Mermaid block still parses by reading it and that no section still describes Menu → Phase 1 directly

## 2. Progress and copy

- [x] 2.1 Create `src/systems/PhaseProgress.ts` with the module-level completed set, `stateOf`, `complete`, `focusTarget` and `sceneKeyOf`, plus the development-only `window.__phaseProgress` handle; verify with `yarn build` and by checking that the production bundle does not contain `__phaseProgress`
- [x] 2.2 Create `src/data/phaseSelectText.ts` with the title, description, back label and `lockedToast(previousPhase)`; verify `lockedToast(2)` returns exactly "Conclua a fase 2 para desbloquear." and `yarn build` passes

## 3. UI components

- [x] 3.1 Add the `muted` token to `neutral` in `src/config/palette.ts` and an `outline` variant to `SeraButton` (paper fill, 2 px neutral-900 border, muted hover, zinc-900 label); verify `yarn build` passes and `MenuScene` compiles unchanged
- [x] 3.2 Create `src/ui/PhasePlate.ts` with the three states, the separate padlock child, the pulse, the shake and the focus frame, following design.md §3; verify `yarn build` and `yarn lint` pass
- [x] 3.3 Create `src/ui/SeraToast.ts` with `show(text)`, replacement of a visible toast, the 2.5 s timer and the reduced-motion path; verify `yarn build` and `yarn lint` pass

## 4. Scenes and music

- [x] 4.1 Rework `MenuMusic` so `start` is idempotent while playing or pending, `stop` clears everything and cancels a pending start, and a later `start` plays from the beginning; remove the `isStillWanted` parameter; verify `yarn build` passes
- [x] 4.2 Add minimal `Phase2Scene` and `Phase3Scene` stubs registered under their keys, matching the existing `Phase1Scene` stub; verify `yarn build` passes
- [x] 4.3 Create `src/scenes/PhaseSelectScene.ts`: layout, stamp entrance skipped on `{ relayout: true }` and reduced motion, plates from `PhaseProgress`, input (tap, arrows, Enter, Space, Esc, Backspace), toast, "Voltar", `MenuMusic.start` on create and `MenuMusic.stop` before starting a phase, resize restart; verify `yarn build` and `yarn lint` pass
- [x] 4.4 Point `MenuScene.startGame` at `PhaseSelectScene`, keeping the fullscreen and orientation requests and no longer stopping the music; register `PhaseSelectScene`, `Phase2Scene` and `Phase3Scene` in `src/main.ts`; verify `yarn build` and `yarn lint` pass
- [x] 4.5 Convert `src/assets/audio/ui_click.wav` to mono `ui_click.ogg` and `ui_click.m4a`, load it in `PreloadScene` through a `UiSound` system, and play it on "Iniciar", on every phase plate activation and on "Voltar" (button, Esc, Backspace); verify `yarn build` bundles both files and `yarn lint` passes

## 5. Verification

- [x] 5.1 Run `yarn build` and `yarn lint` on the whole change and confirm both pass with no warnings
- [ ] 5.2 Ask the owner for authorization, then check in the browser: Iniciar → select screen with music still playing and the click sound; first-visit states; locked tap plays the click and shows padlock shake and the toast, and a second tap replaces it; arrows, Enter, Space, Esc and Backspace; Voltar returns to the cover without the stamp intro; `window.__phaseProgress.complete(1)` then reopening shows Phase 1 completed and Phase 2 unlocked; resize keeps states; reduced motion. Close the tab afterwards
