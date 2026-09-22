# A Aposentadoria de Muri

A 2D side-scrolling platformer in Phaser 3 and TypeScript, made as a gift for
Muricarliton's 50th birthday. Guests play it once, on their phones, in landscape, during
the party. It is a static, client-only build: three linear phases, each ending in a 5×5
memory puzzle that unlocks one essential item; victory is the beach. The party date is
fixed, so scope bends and the date does not.

## Language

Code, file names, comments, rules, agent files and project documents are in **English**.
Every string the player reads is in **Brazilian Portuguese**, informal, exactly as the
family speaks. Never translate in-game text and never "correct" a locked line.

## Source of truth

1. `.agents/rules/` — locked decisions. Wins on conflict, by design.
2. `.agents/docs/system-design.md` and `.agents/docs/guidelines.md` — the original design.
3. Nothing else. When neither answers, ask the owner. A reasonable guess is still a defect.

Deliberately open values are listed in `.agents/rules/content-open-decisions.md`: use the
documented baseline and say so, never settle them silently.

## The team

Five agents live in `.agents/agents/` and are exposed to Claude Code through symlinks in
`.claude/agents/`. The main session coordinates them; there is no orchestrator agent.

| Agent | Decides | Writes |
| --- | --- | --- |
| `game-designer` | mechanics, rules of play, tuning values, game flow | `gameplay-*` and `audio-*` rules, tuning values in `src/config/gameConfig.ts` |
| `level-designer` | what happens in each phase: route, threats, coins, pickups, thief encounters, puzzle content, dialogue | `content-*` rules, `phasesConfig.ts` content, `src/assets/tilemaps/`, `src/data/dialogueLines/`, `src/data/puzzleThemes/` |
| `game-artist` | how everything looks; which existing art composes each screen | `art-*` rules, `src/assets/sprites/`, tileset and parallax artwork |
| `ui-ux-designer` | layout, hierarchy, flows and states of every screen, HUD and control | `ui-*` rules, UI strings in `src/data/*Text.ts` |
| `dev` | how it is built | all logic in `src/`, tooling, build and deploy |

Designers write rules and data; the dev writes logic. A designer never edits a scene, an
entity or a system, and the dev never invents a mechanic, a layout, a line or a value.

**Flow for a feature:** the designers it touches define it (game → level → UI/UX, only
those needed) → the game artist supplies or picks the art → the dev implements → gates.
A small change or a bug fix goes straight to the dev, or is done in the main session.

**OpenSpec** (`/opsx:*`) is only for large work: a new system or scene, or a feature
that needs decisions from two or more designers. Everything else is implemented
directly. A change is archived as soon as its tasks are done.

## Code rules that never bend

1. `strict: true`. No `any`, no `as` outside a type guard. Named exports only; the file
   name equals the exported class name equals the Phaser scene key.
2. No gameplay number in a scene or entity: tuning goes in `gameConfig.ts`, per-phase
   data in `phasesConfig.ts`.
3. No player-facing string in a scene or entity: it comes from `src/data/`.
4. No persistence and no network: no storage APIs, no `fetch`, no runtime CDN. Progress
   lives in memory for the lifetime of the tab.
5. The three phase scenes share one implementation and differ only by `PhaseConfig`. A
   branch on the scene key is a defect.
6. `PuzzleScene` is an overlay: `scene.pause()` the phase, `scene.launch()` the puzzle.
7. Comments are the exception: no file headers, nothing that restates the code, only a
   one- or two-line non-obvious *why*.
8. Build against placeholders under the final asset key; art never blocks code.

## Game invariants

Five hearts, one lost per contact, no lives, no continues, no checkpoints, no bosses, no
knockback, no i-frames and no blink. Single jump. Melee is unlimited; ranged uses ammo
that only comes from pickups. Thieves are placed encounters that take 5%, 15% or 30% of
the common coins and never touch the retirement money. The puzzle costs no hearts and
loops until solved. Cordel Arcade palette (`art-palette-cordel.md`) on a locked 64 px
grid. Touch-only controls. Out of scope (`system-design.md` §19): multiplayer,
persistence, accounts, backend, per-guest customisation.

## Gates

- Every code change ends with `yarn build` and `yarn lint` passing.
- **Git:** no commit, merge, rebase, push, reset, tag or branch deletion without the
  owner's explicit authorization, per action (`architecture-git-authorization.md`).
  Work ends in the working tree with a summary.
- **Browser:** no preview pane, Chrome, headless browser or dev server for a browser
  without the owner's explicit authorization (`architecture-browser-authorization.md`).
  The game plays looping music. When only a visual check can confirm a change, say it
  was not done and ask.

## Where to look

| Area | Rules |
| --- | --- |
| Precedence, scenes, client-only, git, browser | `.agents/rules/architecture-*.md` |
| TypeScript, `gameConfig`, `PhaseConfig` | `.agents/rules/code-*.md` |
| Player, combat, health, enemies, thieves, puzzle, camera | `.agents/rules/gameplay-*.md` |
| Palette, grid, linework, contrast, naming | `.agents/rules/art-*.md`; the full visual guide is `.agents/docs/guidelines.md` |
| HUD, virtual controls, orientation, parallax | `.agents/rules/ui-*.md` |
| Music and SFX | `.agents/rules/audio-*.md` |
| Level progression, dialogue, open decisions | `.agents/rules/content-*.md` |

New rules follow `.agents/rules/_template.md`. Skills live in `.agents/skills/<name>/`
and are symlinked into `.claude/skills/`; agents follow the same pattern.
