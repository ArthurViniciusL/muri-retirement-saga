---
title: Cordel Arcade Palette, Six Tones
impact: HIGH
impactDescription: the palette is the game's visual identity and ties it to the invitation
tags: art, palette, color
---

## Cordel Arcade Palette, Six Tones

The game uses the invitation's Cordel Arcade palette: its three colours plus three tones
mixed between them. No other hue appears anywhere — not in sprites, tiles, HUD, puzzle
cards, UI components, particles or `index.html`.

| Token | Name | Hex | Use |
| --- | --- | --- | --- |
| `bone` | Branco Osso | `#F4EEDD` | paper, lightest background, text on dark, gouge marks |
| `dust` | 75% bone + 25% sertão | `#D2C3AF` | far parallax, secondary background, muted UI |
| `clay` | 50% bone + 50% sertão | `#B09882` | middle parallax, background scenery |
| `sertao` | Marrom Sertão | `#6B4226` | detail, hatching, button hover, playable fills |
| `umber` | 50% sertão + 50% ink | `#442B1B` | shadow and detail on playable elements |
| `ink` | Preto Entalhe | `#1C1410` | outline, carved masses, display text |

The values live in `src/config/palette.ts` and, for the art pipeline, in
`.agents/skills/design-asset/scripts/pixelpng.py`. Everything else references a token.

A single sprite uses at most **three or four tones** at once. The whole ramp in one
element reads as a soft gradient, which is forbidden.

**Incorrect:**

```ts
graphics.fillStyle(0x18181b, 1); // a literal, and a zinc one
```

**Correct:**

```ts
graphics.fillStyle(palette.ink, 1);
```

Reference: `.agents/docs/guidelines.md` §1, §2
