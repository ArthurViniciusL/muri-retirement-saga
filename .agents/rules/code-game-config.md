---
title: Central Game Configuration and Starting Physics Values
impact: MEDIUM
impactDescription: keeps tuning in one file and gives playtests a known baseline
tags: code, configuration, physics
---

## Central Game Configuration and Starting Physics Values

Global tuning lives in `src/config/gameConfig.ts`. Per-phase tuning lives in
`phasesConfig.ts`. Nothing gameplay-related is tuned inside a scene or an entity.

The design documents do not specify physics values, so these are the locked starting
points. They are a baseline to play against, not a final balance — change them in this
file after playtests, never at the call site.

```ts
export const gameConfig = {
  render: {
    logicalHeight: 576,        // locked; 9 tiles of 64 px
    minLogicalWidth: 1024,     // level design assumes this much is visible
    maxLogicalWidth: 1440,
    pixelArt: true,
    roundPixels: true,
    antialias: false,
  },
  physics: {
    gravityY: 1800,
    playerSpeed: 220,
    jumpVelocity: -720,        // peak ≈ 144 px: clears a platform 128 px (2 tiles) above
    jumpCutFactor: 0.45,       // releasing jump while rising multiplies the rise once
    coyoteMs: 80,
    jumpBufferMs: 100,
    maxFallSpeed: 1200,        // 20 px per 60 Hz step, safely under tileBias
    tileBias: 32,              // Arcade default (16) lets a long fall pass through the ground
  },
  player: {
    standingBody: { width: 40, height: 88 },
    crouchingBody: { width: 40, height: 56 },
  },
  combat: {
    damageCooldownMs: 400,     // technical cooldown; there are no i-frames
    maxHearts: 5,
  },
  camera: {
    lerp: 0.12,
    deadzoneWidthRatio: 0.3,
    deadzoneHeightRatio: 0.4,
  },
  parallax: {
    farScrollFactor: 0.25,     // per ui-parallax.md
    midScrollFactor: 0.5,
  },
  controls: {
    margin: 64,                // from every screen edge
    buttonSize: 128,
    buttonHitRadius: 72,       // circle larger than the 128 px button
    buttonGap: 16,
    pauseSize: 64,
    pauseHitSize: 96,
  },
} as const;
```

**Incorrect:**

```ts
this.body.setVelocityY(-720); // same number will be re-typed, and drift, elsewhere
```

**Correct:**

```ts
this.body.setVelocityY(gameConfig.physics.jumpVelocity);
```

Reference: `.agents/docs/system-design.md` §5, §18
