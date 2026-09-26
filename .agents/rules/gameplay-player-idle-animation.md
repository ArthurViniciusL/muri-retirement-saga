---
title: Idle Animation Contract
impact: MEDIUM
impactDescription: keeps a standing Muri alive on screen without ever lifting his feet off the ground
tags: gameplay, player, animation, idle
---

## Idle Animation Contract

`Idle` plays a two-frame loop — `muri_idle_01`, then `muri_idle_02` — forever, each frame
held for `player.animations.idle.frameDurationMs`. With two frames a ping-pong and a
forward loop are the same sequence, so this is a plain `repeat: -1` loop and nothing
builds a yoyo.

The two frames are the same drawing, the upper body seven source pixels lower on the
second: the idle is a breath, not a change of pose. **That offset is artwork, never
character movement.** The physics body is set once per posture, from `player.standing`,
and is identical on both frames. Muri's feet must rest on exactly the same line in both,
because a standing character whose feet float or sink into the ground is the one idle
defect a guest reads from across the room.

That already holds, and the art is built for it: both frames share one untrimmed 190×550
rect, the legs are pixel-identical between them, and the support foot sits on the last row
of both. With `setOrigin(0.5, 1)` and a single `setDisplaySize`, the contact line matches.
It stops holding the moment a frame is trimmed to its own bounding box — frame 02 has 7 px
of transparent header, so a trimmed atlas would shrink it and drop Muri into the ground —
or the moment the sprite is resized per frame. **Verifiable:** across a full idle loop,
`displayHeight`, `body.bottom` and `getBottomCenter().y` never change.

At the configured display height the breath is about one pixel. It is meant to be that
subtle and must not be amplified with a tween or a per-frame y offset.

**Entering and leaving.** The animation starts on *entry* into `Idle` and restarts from
frame 01, the settled pose with both feet flat — landing a jump onto the mid-breath frame
reads as a hitch. Leaving `Idle` for `Walk`, `Jump` or `Crouch` stops it and the new state
owns the sprite. Nothing calls `play` while `Idle` is already running, or the loop is
re-seeded every tick and freezes on frame 01 forever.

`scene.pause()` under the puzzle overlay freezes the loop with the scene and resumes it
where it stopped. Resuming is not re-entering `Idle`, so it does not restart: the player
never moved.

This file is the precedent for the other states. `Walk`, `Jump` and `Crouch` each get
their own `player.animations` entry and their own rule when their art lands; none of them
inherits these values.

**Incorrect:**

```ts
// Re-played every tick: the loop never reaches frame 02.
// Resized per frame: the 7 px breath turns into Muri sinking into the ground.
this.play('muri_idle');
this.setDisplaySize(this.frame.width, this.frame.height);
```

**Correct:**

```ts
// Only on entry. The display size stays the one applyPosture() set for the posture.
if (next === 'Idle' && previous !== 'Idle') {
  this.play('muri_idle');
}
```

Reference: `.agents/docs/system-design.md` §5, §18; `.agents/rules/gameplay-player-state-machine.md`
