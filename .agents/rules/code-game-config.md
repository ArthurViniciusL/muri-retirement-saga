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
    jumpVelocity: -620,        // clears a platform 128 px (2 tiles) above
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
} as const;
```

**Incorrect:**

```ts
this.body.setVelocityY(-620); // same number will be re-typed, and drift, elsewhere
```

**Correct:**

```ts
this.body.setVelocityY(gameConfig.physics.jumpVelocity);
```

Reference: `.agents/docs/system-design.md` §5, §18
