---
title: Combat — One Hit Kills, Ranged Costs Ammo
impact: HIGH
impactDescription: keeps combat readable and the ranged attack scarce
tags: gameplay, combat, ammo
---

## Combat — One Hit Kills, Ranged Costs Ammo

- **Melee** has no usage limit, a short hitbox in front of Muri, and kills any
  environmental enemy in one hit.
- **Ranged** kills in one hit as well, but consumes ammo. Ammo is limited per phase and
  is refilled **only** by pickups placed in the scenery. It never regenerates over time.
- **Defend** reduces incoming damage partially and allows movement.
- Environmental enemies have no hit points and no health bar. One hit of either kind
  removes them.
- No phase has a boss. Every encounter is a common enemy along the route.

Ammo pickup positions come from `PhaseConfig.ammoPickups`. The exact count and
placement per phase are level-design tuning, kept in configuration.

**Incorrect:**

```ts
enemy.hp -= 1;                     // enemies have no HP
if (this.time.now > this.nextAmmoRegen) this.ammo.add(1);  // no time-based refill
```

**Correct:**

```ts
enemy.destroy();                   // any hit is lethal
this.ammo.consume(1);              // refilled only by pickups
```

Reference: `.agents/docs/system-design.md` §6, §8
