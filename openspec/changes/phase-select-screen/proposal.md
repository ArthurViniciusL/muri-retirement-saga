## Why

Pressing "Iniciar" on the cover drops the guest straight into Phase 1, and the game
offers no way to see progress or pick which phase to play. The second stage of the game
needs a phase select screen between the cover and the phases, so guests can see which
phases they have finished, which one comes next and which ones are still locked.

## What Changes

- Add a phase select screen that loads right after the guest presses "Iniciar" on the
  cover. It shows the title "Selecione uma fase para jogar.", the description "Hora de
  iniciar a saga de aposentadoria." and three phase icons laid out as `[ 1 ] [ 2 ] [ 3 ]`.
- Each phase icon has one of three states: completed (number plus a carved check mark),
  unlocked (number, highlighted with a pulse and initial keyboard focus) and locked
  (hatched paper with a carved padlock).
- Tapping a locked phase shakes its padlock and shows a toast at the bottom centre:
  "Conclua a fase {n-1} para desbloquear." The toast lasts 2.5 s and a new toast
  replaces the current one.
- Completed phases can be replayed. Finishing a phase returns the guest to the select
  screen with the next phase unlocked; finishing the last remaining phase leads to the
  victory screen.
- Phase progress lives only in memory for the lifetime of the tab. A reload unlocks
  Phase 1 only.
- Add a "Voltar" button in the top-left corner (Sera `outline` variant). Esc and
  Backspace also go back. Returning to the cover does not replay the stamp intro and
  does not restart the music.
- Keyboard: arrow keys move focus between phases, Enter and Space confirm.
- The `start_menu` track keeps playing on the select screen and stops only when a phase
  starts.
- Pressing "Iniciar", activating any phase icon and pressing "Voltar" play the UI click sound
  (`ui_click`, shipped as `.ogg` and `.m4a`).
- **BREAKING** (project rules and docs): the game grows from nine to ten scenes. Update
  `.agents/rules/architecture-scene-structure.md` and `.agents/docs/system-design.md`
  §3 (scene table) and §17 (game flow), which currently describe a strictly linear
  Menu → Phase 1 → Phase 2 → Phase 3 flow.

## Capabilities

### New Capabilities

- `phase-select`: the phase select screen — layout and copy, the three phase icon
  states, locked-phase feedback with a toast, keyboard and back navigation, and music
  continuity between the cover and the select screen.
- `phase-progress`: in-memory tracking of which phases are completed and unlocked, the
  linear unlock rule, replay of completed phases and the return to the select screen (or
  to victory) after a phase is completed.

### Modified Capabilities

None. `openspec/specs/` has no existing capabilities yet.

## Impact

- New scene `PhaseSelectScene` registered in `src/main.ts`; `MenuScene.startGame` goes
  to it instead of `Phase1Scene`, and the call to `MenuMusic.stop` moves to phase start.
- New UI pieces in `src/ui/`: phase plate (three states, drawn with `Woodcut`), Sera
  toast and an `outline` variant for `SeraButton`.
- New in-memory progress module in `src/systems/` and new copy file
  `src/data/phaseSelectText.ts`.
- `Phase2Scene` and `Phase3Scene` need the same stub registration `Phase1Scene` already
  has, so the select screen can start them.
- Project rule and System Design updates listed above. No new dependencies, no
  persistence, no network access.
