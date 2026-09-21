## Context

See proposal.md for motivation and specs/ for the required behaviour.

Current state that shapes the approach:

- `MenuScene.startGame` stops the menu music, requests fullscreen and the landscape
  lock, then calls `scene.start('Phase1Scene')`. A module-level `introPlayed` flag
  already makes the cover skip its stamp intro after the first run.
- `MenuMusic` keeps its state at module level and guards `start` with a `requested`
  flag, so the track is loaded and started once per page load. The `isStillWanted`
  callback exists so that the "Iniciar" tap which unlocks audio does not start music
  that is no longer wanted.
- `src/main.ts` registers only `BootScene`, `PreloadScene`, `MenuScene` and
  `Phase1Scene`. `Phase2Scene` and `Phase3Scene` are header-only files and
  `VictoryScene` is not implemented. No phase can be completed yet.
- The UI kit is code-drawn: `Woodcut` (carved outlines, gouge marks, 45° hatching),
  `TitlePlate` (carved matrix with hatched shadow), `SeraButton` (default variant only)
  and `PixelFont` (bitmap font, registered for zinc-50 and zinc-900).
- Constraints: zinc palette plus the approved neutral tokens for Sera components; no
  transparency, gradients or glow; text through `PixelFont` only; no persistence; logical
  height 576 with elastic width 1024–1440; the project has no automated test runner, so
  verification is `yarn build`, `yarn lint` and, with the owner's authorization, a
  browser check.

## Goals / Non-Goals

**Goals:**

- One new scene and a small, reusable set of UI pieces (phase plate, toast, outline
  button) that later screens can reuse.
- A single place that owns phase progress, so the phases only report "completed" and
  never decide where to go next.
- The select screen reads as the same printed object as the cover: carved matrices on
  paper.

**Non-Goals:**

- Implementing phase gameplay, the victory screen or the "phase completed" moment inside
  a phase. This change only provides the progress API those will call.
- Item icons on completed plates (deferred until item sprites exist).
- Any persistence of progress.

## Decisions

### 1. A new `PhaseSelectScene`, not a second state inside `MenuScene`

The select screen gets its own scene key, registered between `MenuScene` and the phase
scenes. Resizing already restarts scenes to redo their layout, and a separate scene lets
the select screen restart without touching the cover and its intro state.

Alternative considered: two states inside `MenuScene`. Rejected by the owner; it would
also tangle the cover's stamp intro with the select screen's resize handling.

The scene count rule becomes ten scenes. `.agents/rules/architecture-scene-structure.md`
is updated, and `.agents/docs/system-design.md` §3 (table row) and §17 (flow diagram)
are updated to the new flow. New prose in these files is written in English, per the
project's document language rule; identifiers and existing Portuguese labels stay as
they are.

### 2. `PhaseProgress` as a module-level system

`src/systems/PhaseProgress.ts` holds a module-level set of completed phase numbers
(`1 | 2 | 3`). It exposes:

- `stateOf(phase)`: `'completed' | 'unlocked' | 'locked'`, from the linear rule;
- `complete(phase)`: marks the phase and returns the scene key to go to next
  (`'PhaseSelectScene'` or `'VictoryScene'`);
- `focusTarget()`: the unlocked phase, or Phase 1 when all are completed;
- `sceneKeyOf(phase)`: `'Phase1Scene' | 'Phase2Scene' | 'Phase3Scene'`.

Module state survives `scene.restart` and scene switches, and is lost on reload, which is
exactly the in-memory contract. It follows the pattern `MenuMusic` already uses.

Alternatives considered: Phaser's `game.registry` (untyped keys, string lookups) and a
`this.registry` data object on each scene (same problem). Rejected for type safety.

Game over does not call `PhaseProgress`, so it cannot change progress.

In development builds only (`import.meta.env.DEV`), `PhaseProgress` is exposed as
`window.__phaseProgress` so the completed and locked states can be checked before any
phase can really be completed. Vite strips the branch from production builds.

### 3. Phase plate drawn in code with `Woodcut`

`src/ui/PhasePlate.ts` is a Container centred on the plate, like `TitlePlate`, so scale
tweens start from the middle. Size is 192 × 192 (three tiles), with 64 px between
plates. Each plate uses its own `Woodcut` seed (`phase-plate-1` …) so it looks the same
on every load and resize.

- **Unlocked**: zinc-950 carved mass, gouge marks in zinc-50 that avoid the number, the
  number carved in zinc-50 at scale 12, hatched zinc-500 shadow offset down-right. It
  pulses (scale 1 ↔ 1.06, 0.8 s, like the "Iniciar" button).
- **Completed**: same as unlocked, plus a carved check mark: a zinc-50 corner notch in
  the top-right with a zinc-950 check inside. No pulse.
- **Locked**: zinc-50 paper face with a thin carved zinc-950 border, 45° zinc-400
  hatching inside, and a padlock polygon in zinc-950 centred. No number, no shadow, so
  it reads as "not printed yet". The padlock is a separate child so it can shake alone.

Each state uses at most four tones. The focus mark is a square zinc-900 frame, 4 px
thick, 12 px outside the plate edge, hard-edged. It moves with focus and is independent
of the pulse.

Alternative considered: PNG sprites through the `design-asset` skill. Rejected by the
owner, to keep the select screen in the same carved language as the cover.

### 4. `SeraToast` for locked-phase feedback

`src/ui/SeraToast.ts` follows the Sera `.cn-toast` rule (`rounded-none`) over shadcn's
Sonner defaults (`popover` background, `popover-foreground` text, `border` border,
`shadow-lg`). Translation to the game:

- background zinc-50, label in `PixelFont` zinc-900 at scale 3, 24 px horizontal padding,
  height 56;
- border 2 px in neutral-900. The Sera `border` token (neutral-200) disappears on the
  zinc-50 paper, and the game's contrast rule wins over the token here;
- `shadow-lg` becomes the same hard hatched zinc-500 shadow the plates use, because the
  game has no blur or transparency.

One toast instance per scene. `show(text)` replaces the label, restarts the 2.5 s timer
and replays the entrance (slide up 16 px, 0.2 s). With reduced motion it appears and
disappears without sliding. Anchored at the bottom centre, 32 px above the bottom edge.

### 5. `SeraButton` gains an `outline` variant

`SeraButtonOptions` gets `variant?: 'default' | 'outline'`, default `'default'`, so
`MenuScene` does not change. Outline, per Sera's `.cn-button-variant-outline`:

- background: the paper (zinc-50) instead of `bg-transparent`, which the game cannot
  use;
- hover: `muted` (neutral-100), added to `neutral` in `src/config/palette.ts`;
- border: 2 px neutral-900, a deliberate deviation from Sera's light `border` token,
  confirmed by the owner for contrast on paper;
- label: `PixelFont` zinc-900.

"Voltar" sits in the top-left corner, 32 px from both edges. It keeps the default size
(height 64), which is also a comfortable touch target.

### 6. Layout and the single entrance moment

Stack, centred horizontally and vertically: title (`PixelFont` zinc-900, scale 4), 24 px
gap, description (zinc-900, scale 3), 48 px gap, the row of three plates. "Voltar" and
the toast are outside the stack.

Entrance: the three plates are stamped one after another (scale 1.3 → 1, `power4.in`,
0.08 s apart) with one short camera shake at the end, echoing the cover's stamp. It
runs each time the scene opens from the cover or a phase, and not on a resize restart:
the resize handler restarts the scene with `{ relayout: true }` in its data, and the
scene skips the entrance when that flag is set. With reduced motion the screen opens in
its final state.

### 7. Input

- Each plate is interactive. Tapping a plate moves focus to it and activates it.
- Keys: `LEFT`/`RIGHT` move focus and stop at the ends; `ENTER`/`SPACE` activate the
  focused plate; `ESC`/`BACKSPACE` go back to the cover.
- Activating a locked plate: the padlock shakes (x ±6 px, 4 yoyo steps, 0.3 s total;
  skipped with reduced motion) and the toast shows
  `phaseSelectText.lockedToast(phase - 1)`.
- A `leaving` flag, like `MenuScene.started`, ignores input once a phase start or a
  back navigation has begun.

### 8. Music ownership

`MenuMusic` changes from "once per page load" to "while a menu screen is shown":

- `start` is idempotent while the track plays or is waiting for the audio unlock.
- `stop` stops and destroys the track and clears the pending state, so a later `start`
  plays the track from the beginning.
- The `isStillWanted` callback is replaced by internal state: `stop` cancels a pending
  start that is waiting for the audio unlock.

`MenuScene` and `PhaseSelectScene` both call `MenuMusic.start`. Only the phase start in
`PhaseSelectScene` calls `MenuMusic.stop`. The "Iniciar" tap therefore no longer stops
the music, and if that tap is the one that unlocks audio, the track starts at that
moment and keeps playing on the select screen.

### 9. Copy lives in `src/data/phaseSelectText.ts`

Title, description, back label and a `lockedToast(previousPhase)` function, following
`menuText.ts`. All characters used are covered by `PixelFont`.

## Risks / Trade-offs

- [Completed and locked-after-progress states cannot be reached through real play until
  phases can be completed] → the development-only `window.__phaseProgress` handle lets
  the browser check call `complete(1)` and reopen the screen.
- [Sera tokens changed for contrast (outline border, toast border and shadow)] → each
  deviation is documented here and in the component header, and was confirmed with the
  owner for the button.
- [Scene count rule changes] → the rule file and System Design are updated in the same
  change, so no document still claims nine scenes.
- [`VictoryScene` is not registered] → `PhaseProgress.complete` returns its key, but
  nothing calls `complete` yet. Registering `VictoryScene` belongs to the change that
  implements it.
- [Width 1024 with three 192 px plates, gaps and focus frames] → the row is about
  700 px wide, well inside the minimum logical width.
- [Music restarts from the beginning after each phase] → accepted; the track is a menu
  loop, and resuming mid-track after a whole phase would feel arbitrary.

## Migration Plan

No data migration. The change ships as one unit: the new scene, the `MenuScene`
redirect and the `MenuMusic` change must land together, or "Iniciar" would lead to a
missing scene or silent menus. Rollback is reverting the change.
