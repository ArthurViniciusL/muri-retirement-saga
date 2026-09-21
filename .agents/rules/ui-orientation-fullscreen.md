---
title: Landscape, Fullscreen and the iOS Fallback
impact: MEDIUM
impactDescription: decides what the guest sees in the first three seconds
tags: ui, mobile, orientation
---

## Landscape, Fullscreen and the iOS Fallback

The game is landscape only. A portrait device shows the warning screen that already
exists in `index.html`; the game does not start behind it.

Fullscreen requires a user gesture, so it is requested from the "Play" tap in
`MenuScene`, never on boot:

```ts
playButton.once('pointerup', () => {
  this.scale.startFullscreen();
  void screen.orientation?.lock?.('landscape').catch(() => undefined);
  this.scene.start('Phase1Scene');
});
```

Both calls fail silently by design. iOS Safari supports neither orientation lock nor
fullscreen on a canvas element, and that is an accepted outcome: on iOS the guest plays
inside the browser chrome, with the portrait warning as the only guard. Never block the
game behind a fullscreen request that cannot succeed.

Reference: `.agents/docs/system-design.md` §14
