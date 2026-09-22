---
title: Woodcut Linework and Hatching
impact: HIGH
impactDescription: carries all visual information once colour is removed
tags: art, linework, texture
---

## Woodcut Linework and Hatching

The stroke carries the Cordel Arcade language: carved wood translated to pixels
(`guidelines.md` §3, §15–§17).

- **Thick, slightly irregular lines.** Never perfectly smooth vectors, even at low
  resolution.
- **Shadow is always hatching** — parallel or crossed lines, or pixel dithering between
  two palette tones. Never a soft gradient, never a drop shadow.
- **No glow, no bloom, no transparency.** A collectible that needs to stand out blinks
  by swapping tones, never by changing opacity or adding light.
- **Outline is mandatory on every playable sprite** — 1 px in `ink`, or the darkest
  tone present in that sprite, around characters, enemies and items, so they read
  against any background.
- **Silhouette first.** Muri, a bat and a thief must be distinguishable by silhouette
  alone, before any internal detail.
- **Gouge marks carve light into dark masses**: short leaf-shaped cuts in `bone`,
  scattered, under 10% of the mass area (`guidelines.md` §15). Hatching is only for
  shadow on bare paper.
- Hearts, item icons and every HUD element follow the same carve. A generic heart icon
  is not acceptable.

**Incorrect:** a 50% opacity white glow behind a collected coin; a two-stop linear
gradient used as shading on a platform tile.

**Correct:** the coin alternating between `ink` and `clay` on a two-frame loop; the
platform shaded with a dithered checker between `sertao` and `umber`.

Reference: `.agents/docs/guidelines.md` §3, §5; `.agents/docs/system-design.md` §7
