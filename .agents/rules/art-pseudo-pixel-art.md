---
title: Pseudo Pixel Art — Strict Authoring, Tolerant Display
impact: HIGH
impactDescription: reconciles pixel art with fullscreen on arbitrary phone ratios
tags: art, rendering, pixel-art
---

## Pseudo Pixel Art — Strict Authoring, Tolerant Display

Pixel-perfect rendering and fullscreen on arbitrary aspect ratios cannot both be true.
This project keeps the pixel art discipline where it shows — in the artwork — and gives
it up where it only costs screen space — in the final upscale.

**Strict at authoring time:**

- Every sprite and tile is drawn on the locked 64 px grid.
- Cordel Arcade palette only (`art-palette-cordel.md`), at most three or four tones per
  sprite.
- Dithering for half-tones. No gradients, no glow, no transparency.

**Tolerant at display time:**

- `pixelArt: true`, `antialias: false`, `roundPixels: true`.
- Fractional scale factors are allowed and expected. Integer zoom is **not** enforced.
- Accepted consequence: on some devices one art pixel covers 2.3 screen pixels and some
  edges are one pixel uneven. This is intentional.

**Forbidden**, because it is what makes pseudo pixel art look like a mistake rather than
a style: mixing resolutions. Text, HUD and puzzle cards render at the same world scale
as everything else. No vector or high-resolution overlay on top of 64 px artwork.

**Incorrect:**

```ts
this.add.text(20, 20, 'Fase 1', { fontSize: '13px', resolution: 3 });  // mixed scales
```

**Correct:**

```ts
// Bitmap font authored on the same grid, rendered at world scale.
this.add.bitmapText(64, 64, 'cordel', 'FASE 1');
```

Reference: `.agents/docs/guidelines.md` §3, §4; `.agents/docs/system-design.md` §16
