---
title: Thieves Are Placed Encounters, Not Random Spawns
impact: HIGH
impactDescription: makes the thief mechanic actually fire within a short phase
tags: gameplay, thieves, level-design
---

## Thieves Are Placed Encounters, Not Random Spawns

Maryana, Mayra and Weruska are contact-only characters. They are never fought, only
avoided by jumping or dodging. On contact with Muri's hitbox they:

1. Remove a percentage of the **common coins** collected so far — Maryana 5%, Mayra 15%,
   Weruska 30%. They never touch the essential retirement money, which comes only from
   the Phase 3 puzzle.
2. Show a `DialogueBubble`, a non-blocking overlay. The game keeps running.

**This rule supersedes `system-design.md` §9.** The document specifies random
appearances with a five-minute per-character cooldown. A party phase lasts two to four
minutes, so a second appearance would be mathematically impossible and the first might
never fire, contradicting the one-to-two appearances promised in §20.

Instead: every thief appearance is a placed encounter, declared in
`PhaseConfig.thiefEncounters` and positioned by the level designer in the tilemap. The
cooldown survives only as a short guard against re-triggering the same encounter while
the player stands inside its zone.

Phase assignment stays as designed: Maryana in Phase 1, Mayra in Phase 2, Weruska in
Phase 3.

**Incorrect:**

```ts
if (Math.random() < 0.001 && now - lastSeen.maryana > 5 * 60_000) {
  this.spawnThief('maryana');   // may never fire in a three-minute phase
}
```

**Correct:**

```ts
this.config.thiefEncounters.forEach((encounter) => {
  this.physics.add.overlap(this.player, this.createThief(encounter), onSteal);
});
```

Reference: `.agents/docs/system-design.md` §9, §20
