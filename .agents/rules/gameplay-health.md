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

There is no life counter, no continue counter and no mid-phase checkpoint. Hearts reset
to five when the phase restarts.

The puzzle is independent of health: failing or timing out costs no heart.

Hearts are drawn in the Cordel Arcade woodcut style, not as a generic heart icon. See
`art-linework-and-texture.md`.

**Incorrect:**

```ts
this.lives -= 1;
if (this.lives > 0) this.scene.restart({ fromCheckpoint: true });
```

**Correct:**

```ts
this.scene.start('GameOverScene', { phaseId: this.config.id });
```

Reference: `.agents/docs/system-design.md` §7, §11, §19
