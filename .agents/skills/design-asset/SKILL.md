---
name: design-asset
description: Authors a new visual asset or character for the game "A Aposentadoria de Muri" (Muricarliton) as a real PNG on the locked 64 px grid, in the Cordel Arcade palette, with the mandatory woodcut outline, gouge marks and hatching, the complete set of required frames, and the correct file name under src/assets/. Use this skill whenever the request touches creating, drawing, generating, redoing or completing any sprite, character, enemy, thief, tileset, platform tile, parallax layer, puzzle card, HUD icon, virtual control button or item icon for this game — including when the user only says "desenha o Muri", "cria o sprite do morcego", "faz o ícone de coração", "preciso da arte da fase 2" or asks for placeholder art, and even if they never mention pixel art, the palette or the style guide. For checking an asset that already exists rather than producing one, use pixel-art-style-check instead.
---

# design-asset

Produce a finished, rule-compliant asset for this game — not a description of one.

An asset here is a PNG file on disk, drawn by a Python script that is committed
alongside it, so any later tweak is a diff instead of a redraw. The constraints below
are not style preferences: the palette is six tones of one warm family, so tone,
silhouette and line carry almost all of the visual information. Breaking one of them does not make the art *different*,
it makes the game unreadable.

## Before drawing anything

Read the rules that govern the asset you are about to make. They are short and they are
the source of truth — `.agents/docs/guidelines.md` is the full visual guide and the rules
supersede it wherever they disagree (`architecture-source-of-truth.md`).

| File | What it locks |
| --- | --- |
| `.agents/rules/art-palette-cordel.md` | The six allowed tones, and the 3–4 tones per sprite limit |
| `.agents/rules/art-grid-and-scale.md` | The locked 64 px grid and every asset size |
| `.agents/rules/art-linework-and-texture.md` | Outline, gouge marks, hatching, no gradient/glow/transparency, silhouette first |
| `.agents/rules/art-contrast-readability.md` | Which tones mean "playable" and which mean "decoration" |
| `.agents/rules/art-asset-naming.md` | File names, folders, facing right only |
| `.agents/rules/ui-parallax.md`, `.agents/rules/ui-hud-layout.md` | Layer tones and HUD sizes |

Then open `references/asset-catalog.md` in this skill and find the row for what you are
making. It lists the **complete** set of frames and files that asset requires. Deliver
the whole row: an idle without its walk cycle, or a bat without its defeat animation, is
a hole that only surfaces when the animation is wired up in Phaser.

If the documents do not answer something — a pose that is not listed, an entity that is
not described, a card subject that is not in the theme list — **ask the owner**. Nothing
in this project is invented (`architecture-source-of-truth.md`). A question costs a
message; a wrong assumption costs an atlas.

## The hard constraints

These are the ones the verifier checks, and the ones that are non-negotiable because
each of them is load-bearing for readability.

1. **Palette only.** The six tones in `PALETTE` (`bone`, `dust`, `clay`, `sertao`,
   `umber`, `ink`) and nothing else. One hex outside it anywhere in the file is a failure.
2. **At most 4 tones per sprite.** Typically outline + shadow + light + one accent. Using
   more of the palette at once reads as a soft gradient, which is exactly the effect the
   woodcut style exists to avoid.
3. **Binary alpha.** Every pixel is fully opaque or fully transparent. Alpha exists to
   cut the sprite out of its box, never as an effect — no fades, no glow, no ghosting.
   A collectible that must stand out blinks by swapping tones between frames.
4. **Outline is mandatory** on every playable sprite, HUD icon, card and button: 1 px of
   the sprite's darkest tone (normally `ink`) around the whole silhouette, so the
   asset reads against any background. Tiles are the exception — see the catalog.
5. **Shadow is hatching or dithering**, never interpolation. A mid tone between two
   palette tones is made by alternating pixels, not by picking a colour in between.
   Dark masses carry a few `bone` gouge marks (`guidelines.md` §15), under 10% of their
   area.
6. **Tone encodes interactivity.** Anything the player collides with or must touch lives
   in `sertao`..`ink`. Anything decorative lives in `bone`..`clay`. Two adjacent
   tones never touch without an outline between them.
7. **The grid is locked at 64.** Entity 64×64, Muri 64×96, tile 64×64, HUD icon 32,
   puzzle card authored 64, virtual button 128. Broken sizes like 48 or 100 are
   forbidden — the tilemap must assemble without resampling.
8. **Facing right only.** The left-facing version is a runtime mirror. Never save one.

## Workflow

### 1. Confirm the set

State, in one line, what you are about to produce: every file name and its size, taken
from the catalog. This is the cheapest moment to catch a misunderstanding about scope.

### 2. Silhouette first, in ASCII

Draw the silhouette before anything else, as an ASCII grid, and print it. With so little
hue to lean on, a sprite that is not recognisable in pure black against the background is
already broken, and no amount of internal detail will save it. Check it against its
neighbours: Muri, a bat and a thief must be separable by outline alone.

Use `Canvas.from_ascii` for organic, irregular shapes — a character, an animal, a
musical instrument — because the source file then shows the silhouette directly and a
fix is a one-character edit. Use drawing calls (`rect`, `line`, `frame`, circles by
formula) for symmetric or geometric shapes like a heart, a coin or a card back, where a
formula keeps both halves identical.

### 3. Shade with hatching

Pick the light direction once per asset and keep it across every frame of that entity.
Shade with `hatch` (engraved parallel strokes — closer to the cordel reference) or
`dither` (a two-tone checker — better for large flat areas like a tile face). Keep the
tone count at or under four.

### 4. Outline last

`canvas.outline("ink")` grows the carve outwards, so the artwork needs at least
1 px of transparent margin — the helper raises an error if the silhouette touches the
canvas edge, which is the usual cause of a half-outlined sprite. Outline after shading,
never before, or the hatching will overwrite it.

### 5. Animate by transforming, not redrawing

Frames of the same action should share a body. `canvas.copy()`, `translated(dx, dy)` and
`place()` let an idle breathe by shifting the torso one pixel, or a walk cycle reuse the
same head across four frames. Redrawing each frame from scratch is how a character's
proportions drift between frames — the most visible animation defect at this resolution,
and the hardest to fix afterwards.

Frame counts come from the catalog. Loops must close: the last frame has to lead back
into the first without a jump.

### 6. Verify

```bash
python3 .agents/skills/design-asset/scripts/verify_asset.py --role player src/assets/sprites/muri_idle_*.png
```

Roles: `player`, `enemy`, `thief`, `projectile`, `item`, `tile`, `hud`, `card`,
`button`, `background`. The script checks size, palette, tone count, binary alpha,
outline coverage, tone range for the role, and the file name. A `FAIL` means fix and
re-run — never report an asset that fails. A `!` warning is a judgement call handed back
to you.

The verifier cannot judge silhouette, proportion, personality or whether a bat looks
like a bat. That is your job, and it is the part that matters — passing the script is
the floor, not the goal.

### 7. Report

Show the ASCII preview of each frame (`canvas.preview()`), list the files written, the
tones used per sprite, and the verifier output. Call out explicitly:

- anything you had to read between the lines of the documents (especially file-name
  vocabulary — see the last section of the catalog);
- anything in the required set you did **not** produce, and why.

Then stop. Wiring the asset into `PreloadScene` or an atlas is a separate job with its
own rules, and committing anything needs the owner's explicit authorisation
(`architecture-git-authorization.md`).

## Where things go

| What | Where |
| --- | --- |
| The PNG files | `src/assets/sprites/` (tilemaps in `src/assets/tilemaps/`) |
| The script that draws them | `tools/art/<entity>.py`, importing the helpers below |
| Nothing anywhere else | — |

Keeping the generator next to the art is the point: pixel art that exists only as a
binary is art nobody can adjust six months later, and this project is built to be
adjusted after playtests.

## The helpers

`scripts/pixelpng.py` is dependency-free (no Pillow, no numpy — neither is installed)
and writes the PNG directly with `zlib`. Import it by path:

```python
import sys
sys.path.insert(0, ".agents/skills/design-asset/scripts")
from pixelpng import Canvas, PALETTE, save_frames
```

| Call | Use |
| --- | --- |
| `Canvas(w, h)` | Empty transparent canvas |
| `Canvas.from_ascii(rows, legend)` | Build from an ASCII grid; legend maps a char to a palette tone or `None` |
| `px`, `rect`, `frame`, `line` | Direct drawing |
| `hatch(x, y, w, h, tone, spacing, cross)` | Woodcut shading, clipped to opaque pixels |
| `dither(x, y, w, h, a, b, density)` | Two-tone checker half-tone |
| `outline(tone)` | 1 px carve around the silhouette |
| `copy`, `translated`, `place`, `flipped` | Frame-to-frame reuse (`flipped` is for preview only) |
| `tones()`, `preview()` | Inspect tone counts and read the silhouette as text |
| `save(path)`, `save_frames(frames, dir, entity, action)` | Write PNGs with the correct names |

`scripts/example_heart.py` is a complete worked example — the HUD heart in full and
empty states, roughly forty lines. Read it before writing your first asset script; every
asset script in this project should be recognisable as a variation of it.

```bash
python3 .agents/skills/design-asset/scripts/example_heart.py --out /tmp/preview
```

## Common failure modes

| Symptom | Cause | Fix |
| --- | --- | --- |
| Sprite disappears against a platform | Playable sprite shaded in mid tones | Push the body into `sertao`..`ink` and keep decoration light |
| Sprite looks blurry or "modern" | More than four tones, or a gradient | Cut to four tones and replace the ramp with dithering |
| Outline breaks on one side | Artwork touched the canvas edge before `outline()` | Shrink or shift the artwork to leave a 1 px margin |
| Tiles show a seam when repeated | Outer outline applied to a tile | Move the carve inside the tile face |
| Character grows or shrinks between frames | Frames redrawn from scratch | Share a base canvas and transform it |
| Two enemies feel the same in play | Silhouettes too close | Redraw at the silhouette stage, before shading |
