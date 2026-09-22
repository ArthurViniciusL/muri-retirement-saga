# Visual Style Guide — "A Aposentadoria de Muri"

The single visual source for the game. It merges the game's original style guide
(sections 1–11, same numbering as before) with the "Cordel Arcade" design system of the
party invitation (sections 12–17). Where a locked rule in `.agents/rules/` says
otherwise, the rule wins.

## 1. Scope

This guide covers every visual element of the game: characters, scenery, UI, HUD and the
puzzle. The game shares the invitation's **Cordel Arcade** identity — the same three
colours, the same carved stroke — translated to pseudo pixel art on a 64 px grid. The
earlier zinc monochrome palette is retired.

## 2. Colour palette

Three colours come from the invitation; three more are mixes between them, so the set
never gains a new hue. Code names are English; the designer's Portuguese names are
proper nouns.

| Token | Name | Hex | Origin | Use |
| --- | --- | --- | --- | --- |
| `bone` | Branco Osso | `#F4EEDD` | invitation | paper, lightest background, text on dark surfaces, gouge marks |
| `dust` | — | `#D2C3AF` | 75% bone + 25% sertão | far parallax, secondary background, muted UI surfaces |
| `clay` | — | `#B09882` | 50% bone + 50% sertão | middle parallax, background scenery |
| `sertao` | Marrom Sertão | `#6B4226` | invitation | subtle detail, hatching, secondary type, button hover, playable fills |
| `umber` | — | `#442B1B` | 50% sertão + 50% ink | shadow on playable elements, internal detail |
| `ink` | Preto Entalhe | `#1C1410` | invitation | outline, carved masses, display text |

The six values live in `src/config/palette.ts` (and, for the art pipeline, in
`.agents/skills/design-asset/scripts/pixelpng.py`). Nothing else repeats a literal hex.

**General rule:** a single sprite uses at most **three or four tones** at once — for
example `ink` outline, `umber` shadow, `sertao` body, `bone` highlight. The whole ramp in
one element reads as a soft gradient, which is forbidden (§3).

## 3. Stroke and texture

- **Thick, slightly irregular lines** — never a perfectly smooth edge, even at 64 px.
- **Shadow is always hatching** — parallel or crossed lines, or pixel dithering between
  two palette tones. Never a gradient, never a drop shadow.
- **No glow, shine or transparency.** A collectible that must stand out blinks by
  swapping tones (for example `ink` and `clay` on two frames), never by opacity or light.
- **Outline is mandatory on every playable sprite**: 1 px of `ink`, or the darkest tone
  in the sprite, all the way around, so it reads against any background.
- **Silhouette first.** Muri, a bat and a thief must be told apart as shapes before any
  internal detail exists.
- **Gouge marks** carve light into dark masses (§15). They are the main texture of the
  style; black hatching is reserved for shadow falling on bare paper.

## 4. Grid and scale

The grid is locked at **64 px** (`art-grid-and-scale.md`). Every entity, tile and UI
element is authored on it or on a multiple of it; UI icons use 32. Mixing scales breaks
the proportion between Muri, enemies and scenery. Tiles follow the same grid so the
tilemap assembles without resampling.

## 5. Characters and required variations

### Muri (playable)

| Action | Frames | Note |
| --- | --- | --- |
| Idle | 2–4 | subtle breathing or sway |
| Walk | 4–6 | walk cycle |
| Jump | 3 | rise / apex / fall |
| Crouch | 1–2 | static pose plus transition |
| Melee attack | 2–3 | wind-up plus strike |
| Ranged attack | 2–3 | wind-up plus throw; the projectile is a separate sprite |
| Defend | 1–2 | guard pose, held while the button is held |
| Hurt | 1 | quick reaction frame; there is no knockback |

Drawn **facing right** and mirrored in code. Muri's frames are drawn by the project
owner; missing poses use an existing frame as a stand-in, never a kit-bashed one.

### Enemies (bat, wild cat, fireball)

| Action | Frames | Note |
| --- | --- | --- |
| Movement (fly / run / trajectory) | 2–4 | continuous loop |
| Defeat (one hit) | 2–3 | the woodcut bursting into fragments |

Each enemy's silhouette must be distinct from the other two: they all deal the same
damage, and the shape tells the player the movement pattern (flies / runs on the ground /
crosses the middle).

### Thieves (Maryana, Mayra, Weruska)

- One standing pose and one approach pose (the moment of the theft).
- Distinct silhouettes, recognisable from afar so the player can decide to dodge.
- No complex walk cycle: they are contact events.
- One reusable dialogue bubble frame, shared by all three.

## 6. Scenery and tilemap

- A modular tileset per phase theme (instruments / video games / coins), always inside
  the palette.
- Minimum tiles per platform: **top, middle, left corner, right corner**.
- **At least three parallax layers**, with tone as the depth cue:
  - Far background: `bone`–`dust`, low contrast, simple silhouettes (stylised sun,
    hills, mandacaru).
  - Middle: `dust`–`clay`.
  - Foreground and playable platforms: `sertao`–`ink`, high contrast, so ground is never
    mistaken for decoration.
- The Cordel Arcade repertoire (§14) is the scenery vocabulary.
- Trigger points (puzzle altar or stall, ammo pickups, coins) read clearly by outline and
  high-contrast tone, never by a tint alone.

## 7. UI and HUD

| Element | Required variations |
| --- | --- |
| Hearts (health) | full / empty; optional one "breaking" frame |
| Common coins (counter) | single icon |
| Ammo | full / empty icon, repeated per current ammo |
| Essential items (instrument, CDs, safe) | silhouette (not collected) / filled (collected) |
| Virtual control buttons | normal / pressed |
| Thieves' dialogue bubble | one reusable frame plus text area |

Every HUD element has its own outline and never relies on opacity to stand out; the HUD
renders on its own layer above the game. Components modelled on shadcn/ui follow the Sera
style (`ui-*` rules) with the palette tokens: `ink` as primary, `sertao` as hover, `dust`
as muted surface.

## 8. Puzzle cards

- 25 cards (5×5), each with a **back** (one pattern per phase) and a **front** (a themed
  illustration: instruments / games / coins).
- Cards use the same palette and stroke as the rest of the game: they belong to the same
  world, not to a separate UI style.
- Cards are authored at 64 and displayed at 96 (`gameplay-puzzle.md`).

## 9. Contrast and readability

Tone contrast is what separates what the player interacts with from decoration.

1. Everything the player collides with — platforms, enemies, thieves, hazards — uses the
   dark end of the palette: **`sertao`, `umber`, `ink`**, with an `ink` outline.
2. Purely decorative elements — backgrounds, parallax — stay in **`bone`, `dust`,
   `clay`** and never compete with playable elements.
3. Two adjacent tones never touch without an outline between them. Hiding decoration
   against the background can be intentional; hiding anything the player must reach or
   dodge never is.

## 10. File naming

```
<entity>_<action>_<frame>.png
muri_idle_01.png
bat_fly_02.png
maryana_idle.png
puzzle_card_instrumento_violao.png
ui_heart_full.png
```

Lower case, frame padded to two digits, under `src/assets/sprites/`
(`art-asset-naming.md`).

## 11. Minimum variation checklist

| Sprite type | Minimum variations |
| --- | --- |
| Muri | the eight animation sets of §5, one direction, mirrored in code |
| Enemy (each) | one movement loop plus one defeat animation |
| Thief (each) | standing pose, approach pose, shared dialogue frame |
| Platform tile (per theme) | top, middle, left corner, right corner |
| Parallax | at least three layers per phase |
| Puzzle card (per theme) | one back plus enough fronts for 25 cards (12–13 unique images) |
| HUD icon (heart, ammo) | full plus empty |
| Essential item icon | silhouette plus filled |
| Virtual control button | normal plus pressed |

---

## 12. Visual concept — Cordel Arcade

Traditional Northeastern Brazilian woodcut (carved stroke, grainy texture, hatching for
shadow) fused with the retro look of early video games, Atari as the reference: geometric,
blocky silhouettes, without vibrant video-game colours. Tone: warm and festive, yet sober,
never childish.

Typography in the invitation is **Xilosa** for headings and **Caveat** for body copy.
In the game, text is drawn with the in-code pixel font (`src/ui/PixelFont.ts`), the
"Atari" half of Cordel Arcade, because high-resolution text over 64 px art mixes
resolutions (`art-pseudo-pixel-art.md`). A lookalike of Xilosa is never substituted.

## 13. Carved shapes

The invitation carves frames with asymmetric corners and bellied sides, imitating a
gouge:

```css
border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
```

In the game the same idea is geometry: `Woodcut.carvedRect` bends long edges into a
slight off-centre belly and lets two or three corners overshoot. Vary it between
neighbouring elements so no two share a silhouette. Sera-style buttons and toasts keep
their square corners (`ui-*` rules); carved shapes are for plates, frames and scenery.

## 14. Iconographic repertoire

- Sertão: mandacaru, cacti, stylised sun, cracked earth.
- Stylised flora.
- Popular religious elements (ex-votos), sparingly.
- Musical instruments: guitar, accordion, pandeiro, triangle, zabumba.
- The name "Muricarliton" and the numeral "50" as a central typographic piece, in cordel
  cover style.

The invitation's vector pieces (`broom`, `cactus_*`, `sun`, `straw_hat`, `flag_001`,
`arcodeon`) live in the sibling `digital-invite` project and are the reference for "the
same hand". `cactus_004.svg` is the reference of record for gouge marks.

## 15. Gouge marks

Gouge marks are the light cuts a gouge leaves **inside** a filled dark mass. They are what
separates a carved plate from a flat silhouette.

**The mark.** A short leaf, not a line and not a wedge: pointed at both ends, swelling in
the middle, bowed slightly in one direction. It holds at least four fifths of its width
across its middle 60% and closes fast at both ends. Width does not scale with length. A
mark never spans its mass: it covers well under a tenth of the length it sits on.

**The field.** Marks are scattered, not a pattern. Density varies by region — the main
mass carries about three times the marks of a secondary one — and a narrow mass gets
fewer marks, never zero. Orientation follows the local long axis of the mass, but about
one mark in six lies more than 45° off it; those cross-lying marks stop the set from
reading as scales or seeds.

**The ink budget.** Under 10% of the mass area is cut away. A piece that reads as a
lighter tone instead of dark has too much removed; the fix is fewer or shorter marks,
never thinner ones.

**At 64 px.** A mark is at least 1 px wide and 2 px long, in `bone` (or the lightest tone
of the sprite) inside an `ink` or `umber` mass. A 64 px sprite carries roughly 3 to 8
marks; a 32 px icon carries at most 2 to 3, or none — below that size the solid
silhouette with its outline wins. UI plates drawn in code use `Woodcut.gougeMarks`, which
implements these proportions.

## 16. Hatching

Hatching describes shadow falling on bare paper. It uses a single angle across every
asset — **45°**, with 45° and 135° for crossed hatching — so the set reads as one system.
In pixel art, hatching is one-pixel diagonal lines or a dither; spacing is at least 2 px,
because tighter hatching turns into a flat mid tone, which is the gradient the style
forbids. Hatching never appears inside a filled mass: that is the job of gouge marks.

## 17. Controlled irregularity

The goal is hand-carved wood, not noise:

- Offset a few points of a long edge by one pixel so it is not ruler-straight; do not
  jitter every edge.
- Let two or three corners of a piece overshoot, never all of them.
- Give long straight edges a slight belly with its apex off centre.
- Symmetric subjects (a sun, a pandeiro) are drawn with both sides slightly different,
  not mirrored.

A piece where every point was moved looks shaky. Choose the places.

**Forbidden everywhere**: gradients, glow, blur or drop shadow filters, partial opacity,
and any colour outside §2.
