---
title: Five Hearts, No Lives, No Continues
impact: MEDIUM
impactDescription: fixes the failure loop of the whole game
tags: gameplay, health, game-over
---

## Five Hearts, No Lives, No Continues

Muri has five hearts. Contact with an environmental enemy costs one heart, subject to
the 400 ms technical cooldown. At zero hearts the run goes to `GameOverScene`, which
restarts the **current phase from the beginning** — not from a checkpoint, and not from
the first phase.

**The death beat.** Losing the last heart plays out in one order: the damage camera shake
already fires, the world freezes, input is ignored, and after
`combat.deathBeatMs` (800 ms, a **baseline**) `GameOverScene` starts. The freeze is
`physics.pause()`, so a Muri who dies airborne hangs in mid-air for the beat instead of
finishing the fall — accepted, because it reads as the moment stopping. Death adds no
effect of its own: no flash, no stronger shake, no death animation, no SFX.

**Falling out of the world is a death**, not a reload: `player.y > config.worldHeight`
goes to `GameOverScene` with **no beat and no shake**, because Muri is already off-screen
and a frozen empty frame would only read as a hang.

There is no life counter, no continue counter and no mid-phase checkpoint. Hearts reset
to five when the phase restarts.

The puzzle is independent of health: failing or timing out costs no heart.

Hearts are drawn in the Cordel Arcade woodcut style, not as a generic heart icon. See
`art-linework-and-texture.md`.

**Incorrect:**

```ts
this.lives -= 1;
if (this.lives > 0) this.scene.restart({ fromCheckpoint: true });
if (this.player.y > this.config.worldHeight) this.scene.restart(); // reads as a crash
```

**Correct:**

```ts
this.physics.pause();
this.time.delayedCall(gameConfig.combat.deathBeatMs, () => {
  this.scene.start('GameOverScene', { phaseId: this.config.id });
});
```

Reference: `.agents/docs/system-design.md` §7, §11, §19
