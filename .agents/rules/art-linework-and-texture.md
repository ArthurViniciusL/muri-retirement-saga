---
title: Woodcut Linework and Hatching
impact: HIGH
impactDescription: carries all visual information once colour is removed
tags: art, linework, texture
---

## Woodcut Linework and Hatching

With no colour available, the stroke carries the whole visual language. It comes from
the shared Cordel Arcade system and is stricter here. Muri's frames are exempt: they
are the owner's drawings, shown as drawn (`art-grid-and-scale.md`).

- **Thick, slightly irregular lines.** Never perfectly smooth vectors, even at low
  resolution.
- **Shadow is always hatching** — parallel or crossed lines, or pixel dithering between
  two zinc tones. Never a soft gradient, never a drop shadow.
- **No glow, no bloom, no transparency.** A collectible that needs to stand out blinks
  by swapping tones, never by changing opacity or adding light.
- **Outline is mandatory on every playable sprite** — 1 px in zinc-950, or the darkest
  tone present in that sprite, around characters, enemies and items, so they read
  against any background.
- **Silhouette first.** Muri, a bat and a thief must be distinguishable by silhouette
  alone, before any internal detail.
- Hearts, item icons and every HUD element follow the same carve. A generic heart icon
  is not acceptable.

**Incorrect:** a 50% opacity white glow behind a collected coin; a two-stop linear
gradient used as shading on a platform tile.

**Correct:** the coin alternating between zinc-900 and zinc-500 on a two-frame loop; the
platform shaded with a dithered checker between two zinc tones.

Reference: `.agents/docs/guidelines.md` §3, §5; `.agents/docs/system-design.md` §7
