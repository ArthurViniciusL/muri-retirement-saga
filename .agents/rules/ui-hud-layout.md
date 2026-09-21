---
title: HUD Layout and Safe Areas
impact: MEDIUM
impactDescription: keeps the HUD legible and out of the phone's cutouts
tags: ui, hud, mobile
---

## HUD Layout and Safe Areas

The HUD renders on its own layer above the game scene, fixed with `setScrollFactor(0)`.
It never relies on opacity to separate itself from the scenery: every HUD element
carries its own outline, per `art-linework-and-texture.md`.

- Icons at 32 logical px: hearts (`HeartsHUD`), coins (`CoinsHUD`), ammo (`AmmoHUD`).
- Margin of **64 logical px** from every screen edge, on top of the CSS
  `env(safe-area-inset-*)` padding applied to the game container.
- In landscape the camera cutout and the gesture bar sit on the left and right edges —
  exactly where the controls live — so the safe-area insets are mandatory, not optional.
- Required states: heart full and empty; ammo full and empty, repeated per unit;
  essential item as silhouette when not collected and filled when collected.

Reference: `.agents/docs/guidelines.md` §7; `.agents/docs/system-design.md` §14
