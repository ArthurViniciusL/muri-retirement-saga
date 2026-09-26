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
- The top-left corner stacks one row per counter, `hud.rowGap` apart: hearts first, then
  the coins as `[icon] [total]` with `hud.iconGap` between them. The number is bitmap
  text in `ink`, vertically centred on the icon, and grows to the right, so a three-digit
  total never pushes the icon off the margin.
- Collecting a coin pulses the icon once to `hud.coinPulseScale` in `hud.coinPulseMs`,
  and nothing else: the coin that vanished in the world has to reappear somewhere, and
  the pulse is that link. Skipped under `prefers-reduced-motion`.
- Margin of **64 logical px** from every screen edge, on top of the CSS
  `env(safe-area-inset-*)` padding applied to the game container.
- In landscape the camera cutout and the gesture bar sit on the left and right edges —
  exactly where the controls live — so the safe-area insets are mandatory, not optional.
- The heart icon has three frames: full, half and empty. Half is not a health value —
  damage always costs one whole heart — it is the middle step of the loss, shown for
  `hud.heartFlashMs` between full and empty while the heart pulses once. Both the flash
  and the pulse are skipped under `prefers-reduced-motion`.
- Required states: heart full and empty; ammo full and empty, repeated per unit;
  essential item as silhouette when not collected and filled when collected.

Reference: `.agents/docs/guidelines.md` §7; `.agents/docs/system-design.md` §14
