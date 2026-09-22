---
title: Three Enemy Types, Three Height Bands
impact: MEDIUM
impactDescription: makes threats readable at a glance by silhouette and tone
tags: gameplay, enemies, readability
---

## Three Enemy Types, Three Height Bands

There are exactly three environmental enemies, and each one owns a height band so the
player can read the threat before reaching it:

| Enemy | Movement | Band |
| --- | --- | --- |
| Bat (`Bat.ts`) | flies, variable altitude | high |
| Wild cat (`WildCat.ts`) | runs along the ground | ground |
| Fireball (`Fireball.ts`) | fixed trajectory | mid-screen, between the other two |

All three deal one heart of damage on contact and die in one hit, melee or ranged. None
of them has hit points, a health bar or a phase-specific variant.

Exact speed, detection range and whether an enemy chases the player or follows a fixed
route are tuning values. They live in configuration and are set per phase, never
hardcoded in the entity class.

Fireballs first appear in Phase 2. Phase 1 uses bats and wild cats only, so the player
learns two bands before the third arrives.

Reference: `.agents/docs/system-design.md` §8, §18, §20; `.agents/docs/guidelines.md` §5
