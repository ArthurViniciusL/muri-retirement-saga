---
title: Scenery Obstacles
impact: HIGH
impactDescription: decides what costs a heart and what only stands in the way
tags: gameplay, scenery, obstacles, collision
---

## Scenery Obstacles

Every scenery object belongs to exactly one of three classes, and the class decides its
physics. Nothing in the scenery is both solid and harmful.

| Class | Objects | Physics |
| --- | --- | --- |
| Hurts | `cactus_red`, `campfire` | Solid static body **and** one heart when the contact starts, guarded by `combat.damageCooldownMs`. |
| Blocks | `cactus`, `rock_formation`, `stone_rock`, `wooden_barrel`, `woodlog`, `pebble`, `fox_car` | Static immovable body. No damage. The player can stand on top. |
| Decorates | `foliage`, `fluffy_cloud` | No body at all, drawn behind the player, and never taller than 40 px on the ground. |

The green cactus is scenery, not a threat: it stops the player and costs nothing. Only
the red cactus and the campfire hurt, so the danger is the exception on the route and
reads by colour.

A harmful obstacle is solid: walking into a campfire stops the player and costs one heart.
It costs only that one heart, because the damage is spent when the contact starts, not
while it lasts; staying pressed against it is safe until the player steps away
and touches it again. That matters because there are no i-frames and no knockback
(`gameplay-health.md`), so per-frame damage would empty the hearts in an instant.

**No obstacle is taller than `scenery.maxObstacleHeight` (96 px).** Peak height is not
the number that matters; what matters is how long the player stays above the obstacle.
With `jumpVelocity: -840` and `gravityY: 1800` the jump peaks at about 196 px, but the
player is above 128 px for only 0.55 s, which is 121 px of forward travel — barely more
than the 98 px a campfire used to be, so a jump started slightly late still clipped it.
Above 96 px the window is 0.67 s and 147 px, against a 74 px campfire: half its width as
margin on each side. That margin, not the peak, is why the cap is 96.

Obstacles that only block are shorter, usually 64 px, because the player is expected to
walk into them and step over instead of timing a jump. Two of them are 96 px, and both
earn it by costing nothing: the green cactus, a landmark of the route, and `fox_car`,
which is a car. **A prop that depicts a real object is scaled against the player, not
against the grid alone**: a car that reaches Muri's shoulder reads as a car, while one
the size of a barrel reads as a toy. At 140×96 it sits just under his 96 px, three times
as long as he is wide. An obstacle taller than the jump is a wall, and a wall belongs in the tilemap.

Losing a heart shakes the camera for `camera.damageShakeMs` at
`camera.damageShakeIntensity`. The shake is light, about three pixels, because it is
feedback and not a punishment, and it is skipped when the guest's device asks for
reduced motion.

Harmful and blocking obstacles are authored in the `obstacles` object layer of the phase
tilemap, each object carrying its asset key as its type. **Two obstacles are never closer
than six tiles, and none of them stands in the opening stretch of a phase**
(`content-level-design.md`): closer than that they read as one pile of clutter and leave no room
to land between them. Six tiles is a jump and as much ground again: a full jump covers about 3.2 tiles at the
current tuning, so the player lands, sees the next obstacle and sets up the next jump
instead of chaining blind jumps. The map script checks the distance and reports it.
Decoration keeps clear of any obstacle, so foliage never hides a cactus.

**Ground decoration grows in threes, at the foot of a cactus.** A bush alone on the
route is noise, and worse, it looks like something to jump. Three of them around a
cactus read as the scrub that grows with it, and every bush on the map has a reason to
be there. The anchor is `decoration.clusterAround` in the phase configuration, the
count and the distances are in `scenery.decoration`, and the seed places them, so the
map file carries no bush at all.

**Ground decoration stays below 40 px**, well under the 48 px of the shortest thing that
blocks. Anything on the route as tall as an obstacle is read as an obstacle, and the
player either jumps what did not need jumping or stops trusting the silhouettes. Decoration is not authored: it
is scattered at runtime from the phase's decoration seed, so it never changes between
guests but never bloats the map.

**Incorrect:**

```ts
// Gasta um coração por quadro enquanto o corpo encosta.
this.physics.add.collider(player, hazards, () => health.loseHeart());
```

**Correct:**

```ts
this.physics.add.collider(player, hazards, this.onHazardContact, undefined, this);
// onHazardContact só tira um coração quando o contato começa.
```

Reference: `.agents/docs/guidelines.md` §6; `.agents/docs/system-design.md` §20
