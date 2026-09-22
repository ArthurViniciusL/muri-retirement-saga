# Asset catalog — required variation sets

Every entry below is the **minimum complete set** for that asset. Delivering fewer
frames than the minimum leaves a hole that only shows up when the animation is wired in
Phaser, which is much later and much more expensive to fix — so a request for "the bat"
means the whole row, not one frame.

Sizes come from `.agents/rules/art-grid-and-scale.md` (the 64 px grid is locked and
supersedes the open 32–64 range in `guidelines.md` §4). Frame counts come from
`guidelines.md` §5, §7, §8 and the checklist in §11.

## Contents

- [File naming](#file-naming)
- [Muri (playable)](#muri-playable)
- [Environmental enemies](#environmental-enemies)
- [The thieves](#the-thieves)
- [Scenery tiles](#scenery-tiles)
- [Parallax layers](#parallax-layers)
- [Puzzle cards](#puzzle-cards)
- [HUD and virtual controls](#hud-and-virtual-controls)
- [Names that the documents do not fix](#names-that-the-documents-do-not-fix)

## File naming

`<entity>_<action>_<frame>.png`, lower case, frame padded to two digits, under
`src/assets/sprites/`. A single-frame asset drops the frame number
(`maryana_idle.png`). Characters are authored **facing right only** — the left-facing
version is produced by mirroring at runtime, and a mirrored file in the repository is a
defect, not a convenience.

## Muri (playable)

Shown from the owner's drawings, displayed 144 px tall (`art-grid-and-scale.md`), not
authored on the grid or checked by the verifier. Frames live in
`src/assets/sprites/muri/<action>/NNN.png`.

| Action | Key | Frames | What the frames are |
| --- | --- | --- | --- |
| Idle | `muri_idle_NN` | 2–4 | Breathing / subtle sway |
| Walk | `muri_walk_NN` | 4–6 | Full walk cycle |
| Jump | `muri_jump_NN` | 3 | Rise, apex, fall |
| Crouch | `muri_crouch_NN` | 1–2 | Static pose, plus transition if 2. The crouch shrinks the hitbox, so the pose must visibly lose height |
| Melee attack | `muri_attackmelee_NN` | 2–3 | Wind-up, then strike |
| Ranged attack | `muri_attackranged_NN` | 2–3 | Wind-up, then throw. The projectile is a separate sprite |
| Defend | `muri_defend_NN` | 1–2 | Guard pose, held while the button is down, and the character can still move |
| Hurt | `muri_hurt_01` | 1 | Reaction frame only — there is no knockback and no i-frames, so this single frame carries all the damage feedback |

There is a `Dead` state in the state machine but `guidelines.md` §5 lists no death
animation for Muri; death cuts to `GameOverScene`. Do not invent one — ask first.

## Environmental enemies

64×64 px. Verifier role: `enemy` (`projectile` for the fireball, same size).

| Enemy | Keys | Frames |
| --- | --- | --- |
| Bat (flies, variable height) | `bat_fly_NN`, `bat_defeat_NN` | 2–4 loop, 2–3 defeat |
| Wild cat (runs on the ground) | `wildcat_run_NN`, `wildcat_defeat_NN` | 2–4 loop, 2–3 defeat |
| Fireball (mid-height trajectory) | `fireball_move_NN`, `fireball_defeat_NN` | 2–4 loop, 2–3 defeat |

All three die in one hit and deal the same damage, so the player cannot learn them by
outcome — only by silhouette. The three silhouettes must be separable in one glance at
gameplay speed: the bat reads wide and angular, the cat long and low, the fireball
round and radiating. If two of them could be confused at 64 px, redraw before shading.

The defeat animation is a **shatter**, not a fade: the woodcut line bursts into
fragments. Fading out would need opacity, which is forbidden.

## The thieves

64×64 px. Verifier role: `thief`. They are contact events, not pursuers, so no walk
cycle is required.

| Thief | Keys |
| --- | --- |
| Maryana | `maryana_idle.png`, `maryana_approach.png` |
| Mayra | `mayra_idle.png`, `mayra_approach.png` |
| Weruska | `weruska_idle.png`, `weruska_approach.png` |

Plus one **shared** dialogue bubble frame, `ui_dialogue_frame.png`, reused by all three
with only the text changing. Size it on the grid; it is a frame with an empty text area,
outlined like everything else — the bubble must never rely on a translucent backing to
separate itself from the scenery.

The three silhouettes must be distinguishable from a distance, because recognising
*which* thief is approaching is what gives the player time to decide to dodge.

## Scenery tiles

64×64 px. Verifier role: `tile`. Per phase theme (`instrumentos`, `xbox`, `moedas`).

Minimum per theme: `tile_<theme>_top`, `tile_<theme>_mid`, `tile_<theme>_left`,
`tile_<theme>_right`. Those four assemble a platform of any length without stretching
the artwork.

Tiles are the one asset that is **not** outlined outwards — an outer outline would show
as a seam when tiles repeat. The carve lives inside the tile: the top tile gets its
heavy edge on the top row, the left and right corner tiles on their outer column. Check
a tile by repeating it three times side by side and confirming the seam disappears.

Tiles are foreground and playable, so they sit in zinc-700..zinc-950.

## Parallax layers

Verifier role: `background`. Every phase needs at least three layers, and the tonal band
is what tells the player which pixels are ground:

| Layer | Scroll factor | Tones |
| --- | --- | --- |
| Far background | 0.25 | zinc-100 – zinc-300 |
| Middle | 0.5 | zinc-400 – zinc-600 |
| Foreground / playable | 1.0 | zinc-700 – zinc-950 (this is the tilemap, not a background image) |

Background images are sized in multiples of 64. The logical viewport is 576 px tall
(9 × 64), so a full-screen layer of 1024×576 or 1440×576 tiles cleanly.

Iconography stays within the shared repertoire: mandacaru, cacti, stylised sun, cracked
earth, stylised flora, musical instruments — adapted to the monochrome carve.

## Puzzle cards

Authored at 64×64, displayed at 96. Verifier role: `card`.

Per phase theme: one **back** (`puzzle_card_<theme>_back.png`, identical for all 25
cards of that phase) and at least 12–13 unique **fronts**, enough to fill a 5×5 grid in
pairs. Front file names follow the example in the naming rule:
`puzzle_card_instrumento_violao.png`.

Themes and their content come from `system-design.md` §11 — instruments for phase 1,
Xbox/games for phase 2 (including the Assassin's Creed, Mass Effect and Batman Arkham
discs), coins for phase 3. Do not invent subjects outside the theme lists in the design
documents and `src/data/puzzleThemes/`; ask instead.

A card is UI but it must look like it belongs to the same world: same hatching, same
outline, no separate illustration style.

## HUD and virtual controls

| Element | Files | Size | Role |
| --- | --- | --- | --- |
| Hearts | `ui_heart_full.png`, `ui_heart_empty.png` | 32 | `hud` |
| Coins | `ui_coin.png` | 32 | `hud` |
| Ammo | `ui_ammo_full.png`, `ui_ammo_empty.png` | 32 | `hud` |
| Essential items | `ui_item_<name>_silhouette.png`, `ui_item_<name>_filled.png` | 32 | `hud` |
| Virtual buttons | `ui_button_<action>_normal.png`, `ui_button_<action>_pressed.png` | 128 | `button` |

Virtual control actions, from `system-design.md` §14: D-pad, jump, melee attack, ranged
attack, defend — each one needs both states.

The heart is explicitly called out in `system-design.md` §7 as *not* a generic heart
icon: it carries the same engraved hatching as the rest of the game. The pressed state
of a button is a tone swap, never a translucency change.

## Names that the documents do not fix

The design documents name the player states in English PascalCase (`AttackMelee`,
`AttackRanged`) and the enemies in Portuguese prose (morcego, gato selvagem, bola de
fogo), while the naming rule's examples are English and lower case (`bat_fly_02.png`).
The keys above are derived mechanically — state name lower-cased, enemy name taken from
the existing class names in `src/entities/` (`Bat`, `WildCat`, `Fireball`).

That derivation is a reading, not a written decision. Say so when you report an asset
whose key came from it, so the owner can correct the vocabulary once, early, instead of
after an atlas is built on it.
