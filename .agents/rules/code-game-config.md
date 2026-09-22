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
    jumpVelocity: -840,        // peaks at about 196 px: clears a 128 px obstacle easily
    jumpCutFactor: 0.45,       // rise kept when the jump intent is released
    coyoteMs: 80,
    jumpBufferMs: 100,
    maxFallSpeed: 1200,
    tileBias: 32,              // Arcade tunnelling guard at high fall speed
  },
  combat: {
    damageCooldownMs: 400,     // technical cooldown; there are no i-frames
    maxHearts: 5,
  },
  player: {
    standing: { display: {...}, body: { width: 40, height: 88 } },
    crouching: { display: {...}, body: { width: 40, height: 56 } },
    crouchSpeedRatio: 0.5,
  },
  controls: { margin: 64, buttonSize: 128, buttonHitRadius: 72, /* … */ },
  scenery: {
    tileSize: 64,
    maxObstacleHeight: 128,    // a full jump has to clear it
    targets: {...},            // framed display size per asset key
    decoration: {...},         // seeded scatter density and cloud band
    parallax: {...},           // scroll factors and generated hill sizes
  },
  camera: {
    lerp: 0.12,
    deadzoneWidthRatio: 0.3,
    deadzoneHeightRatio: 0.4,
  },
  debug: { enabled: true },    // player rectangle, overlay; off when Muri's art lands
} as const;
```

`scenery.targets` is art metadata, not tuning: it holds the display size each scenery
image is framed to, so no scene ever calls `setDisplaySize` with a literal. It lives
here because this file is the one place the project reads sizes from.

**Incorrect:**

```ts
this.body.setVelocityY(-620); // same number will be re-typed, and drift, elsewhere
```

**Correct:**

```ts
this.body.setVelocityY(gameConfig.physics.jumpVelocity);
```

Reference: `.agents/docs/system-design.md` §5, §18
