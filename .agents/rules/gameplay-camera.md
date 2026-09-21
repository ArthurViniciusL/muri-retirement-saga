---
title: Camera, Scale Mode and World Size
impact: HIGH
impactDescription: defines how much of the level every guest sees on any phone
tags: gameplay, camera, scale, mobile
---

## Camera, Scale Mode and World Size

The game targets fullscreen landscape on modern phones, whose aspect ratios vary from
about 16:9 to 20:9. A letterboxed fixed canvas was rejected, so the game uses an
elastic width, the same approach as the Chrome dinosaur game.

- Scale mode: `Phaser.Scale.RESIZE`.
- **Logical height is locked at 576** (9 tiles of 64 px). It never varies, on any device.
- Logical width is elastic: `576 × (screenWidth / screenHeight)`, clamped to
  **[1024, 1440]**.
- Level design is authored against the **1024 minimum**. Nothing the player must see,
  reach or react to may depend on a wider screen. A wider device sees a little further
  ahead; that is the only allowed difference.

World size per phase:

- Width: free, defined by the tilemap.
- Height: `PhaseConfig.worldHeight`, recommended ceiling of two screens (1152 px).

Camera follow:

- Follows the player on **both axes**: horizontally along the route, vertically when
  Muri climbs past the visible area.
- Deadzone of 30% of the width by 40% of the height, so ordinary jumps do not move the
  camera.
- Smoothing: `startFollow(player, true, 0.12, 0.12)`.
- HUD and virtual controls are fixed with `setScrollFactor(0)`.

**Incorrect:**

```ts
this.cameras.main.startFollow(this.player);   // no deadzone: the view jerks on every jump
```

**Correct:**

```ts
const cam = this.cameras.main;
cam.setBounds(0, 0, map.widthInPixels, this.config.worldHeight);
cam.startFollow(this.player, true, gameConfig.camera.lerp, gameConfig.camera.lerp);
cam.setDeadzone(cam.width * 0.3, cam.height * 0.4);
```

Reference: `.agents/docs/system-design.md` §14
