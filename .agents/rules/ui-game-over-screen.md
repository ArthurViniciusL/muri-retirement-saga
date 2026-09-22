---
title: Game Over Screen
impact: MEDIUM
impactDescription: the only door back into play after a run ends; an unreadable button ends the guest's night
tags: ui, screen, game-over
---

## Game Over Screen

`GameOverScene` is a full screen, not an overlay: the phase is gone, the field is solid
`ink` edge to edge. It carries one message and one action, stacked and centred in the
same rhythm as `MenuScene` and `PhaseSelectScene`. It is the first dark screen in the
game, so every tone on it is inverted from the paper screens.

The scene receives the phase to restart as scene data — the `PhaseSceneKey` of the phase
the guest died in, passed by `PhaseScene` — plus the relayout flag used on resize. The
button restarts that phase and nothing else. There is deliberately no second button and
no route to the phase select screen from here.

### Layout at 1024×576

Logical px. Vertical positions are the result of centring the stack, not hand-placed
constants; the values below are the stack resolved at 1024×576.

```
  x=0                              x=512                            x=1024
  ┌────────────────────────────────────┼────────────────────────────────────┐ y=0
  │                                                                         │
  │                        solid `ink` field, full viewport                 │
  │                                                                         │
  │      ┌──────────────────────────────────────────────────┐               │ y=182
  │      │           Acabaram os corações                   │  464 × 44     │
  │      └──────────────────────────────────────────────────┘               │ y=226
  │                              ↕ 24                                       │
  │       ┌────────────────────────────────────────────────┐                │ y=250
  │       │        A fase começa de novo, Muri.            │  444 × 33      │
  │       └────────────────────────────────────────────────┘                │ y=283
  │                              ↕ 48                                       │
  │              ┌───────────────────────────────┐                          │ y=331
  │              │       TENTAR DE NOVO          │  auto × 64               │
  │              └───────────────────────────────┘                          │ y=395
  │                                                                         │
  │                                                                         │
  └─────────────────────────────────────────────────────────────────────────┘ y=576
                        every box centred on x = width / 2
```

**Anchors.** Nothing is anchored to a corner. Every element is centred horizontally on
`width / 2`, and the whole stack is centred vertically in the 576 logical px:

```
stackHeight = title.height + 24 + support.height + 48 + 64   → 213 at 1024×576
top         = round((576 - stackHeight) / 2)                 → 182
```

The gaps are 24 (title → support) and 48 (support → button), the same two gaps
`PhaseSelectScene` uses. A wider viewport (up to 1440) only gains side margin; the stack
never moves vertically and never reflows. The widest element, the title, is 464 px wide
at 1024 — 280 px inside the 64 px HUD margin on each side.

### Elements

| # | Element | Copy key | Size | Tone | Notes |
| --- | --- | --- | --- | --- | --- |
| 0 | Background field | — | full viewport | `ink` | repainted on every relayout; covers the `bone` canvas colour |
| 1 | Title | `gameOverText.title` | 464 × 44 at 1024 (`PixelFont.sizeFor(4)`) | `bone` | single line, never wrapped, `setOrigin(0.5, 0)` |
| 2 | Support line | `gameOverText.description` | 444 × 33 at 1024 (`PixelFont.sizeFor(3)`) | `dust` | single line, never wrapped, `setOrigin(0.5, 0)` |
| 3 | Restart button | `gameOverText.retryLabel` | width computed by `SeraButton` (≈ 360), height 64 | see below | `SeraButton`, solid variant, uppercased label at scale 3, tracking 3 |

Text widths are derived from the bitmap font and are given here as the measured value at
1024; the button width is whatever `SeraButton` computes from its label plus 40 px of
padding each side. Because all three are centred, none of those widths moves anything
else.

`PixelFont` registers one bitmap font per tone and today only `bone` and `ink` are
registered. This screen is the first to need a third: the `dust` support line requires
`dust` to be registered alongside them.

### The button is solid, and its tones are inverted

The button is the **solid** `SeraButton` — a filled slab, not the `outline` variant. But
the existing solid rendering fills with `sera.primary`, which *is* `ink`: on this screen
that paints an ink slab on an ink field and the only control in the game's failure loop
disappears. This screen therefore uses the solid button with the on-ink tone pair:

| State | Face | Label | Geometry |
| --- | --- | --- | --- |
| idle | `bone` | `ink` | face 64 tall, label centred |
| hover (pointer devices only) | `dust` | `ink` | unchanged |
| pressed | `dust` | `ink` | face and label offset 2 px down, pulse paused |

No border, no `outline` variant, no disabled state and no focus ring: there is exactly
one control on the screen and Enter/Space act on it globally, so there is nothing to
move focus between. Everything else about the component is unchanged — same height, same
padding, same 2 px press offset, same uppercase label with wide tracking.

The touch target is the face, 64 px tall and ≈ 360 px wide, centred at y = 363 — well
clear of the lower corners where thumbs rest, and this screen has no virtual controls to
collide with.

### Transitions

| Moment | What happens | Duration |
| --- | --- | --- |
| open | stamp intro: title, support, button, in that order | 0.28 s each, `power4.in`, scale 1.3 → 1 |
| open | stagger between the three elements | 0.08 s |
| open | delay before the first stamp | 0.10 s |
| open | camera shake when the last element lands | 120 ms, intensity 0.005 |
| after intro | button pulses, continuous yoyo | 0.80 s per half, scale 1.06 |
| press | face and label drop 2 px, pulse paused | immediate |
| activate | UI click plays, phase starts | immediate |

Total intro ≈ 0.54 s. The button is interactive from the first frame, during the intro
included: a guest who already knows the screen must not be made to wait.

### Motion, resize and input

- `Motion.isReduced()`: no stamp, no camera shake, no pulse. The final state is drawn
  immediately and the button is pressable at once.
- Resize relays out through `scene.restart` carrying the same data, exactly as
  `PhaseSelectScene.handleResize` does. The phase to restart **must** survive the
  relayout — it is the whole point of the screen. On a relayout the stamp intro does not
  replay; the button pulse starts straight away (unless motion is reduced).
- Enter and Space activate the button. Esc and Backspace are not bound: there is nowhere
  to go back to.
- Activation is guarded: the second press of a double tap does nothing.
- Sound: `UiSound.click` on activation, like every other screen. Nothing else — no game
  over jingle exists and the menu track stays stopped.

**Incorrect:**

```ts
// Solid SeraButton over an ink field: sera.primary === palette.ink. Invisible button.
this.cameras.main.setBackgroundColor(paletteCss('ink'));
new SeraButton(this, { centerX, top, label: gameOverText.retryLabel, onPress });
```

**Correct:**

```ts
// Solid slab, tones inverted for the dark field: bone face, ink label, dust when pressed.
// The dev names the flag; the spec only fixes the tones.
new SeraButton(this, { centerX, top, label: gameOverText.retryLabel, onDark: true, onPress });
```

Reference: `.agents/rules/art-palette-cordel.md`, `.agents/rules/art-contrast-readability.md`,
`.agents/rules/ui-hud-layout.md`; `.agents/docs/guidelines.md` §2, §6, §12
