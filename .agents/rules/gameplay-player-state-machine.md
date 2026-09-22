---
title: Player State Machine
impact: HIGH
impactDescription: defines every action Muri can take and what each one costs
tags: gameplay, player, states
---

## Player State Machine

Muri has exactly nine states: `Idle`, `Walk`, `Jump`, `Crouch`, `AttackMelee`,
`AttackRanged`, `Defend`, `Hurt`, `Dead`. `PlayerStateMachine.ts` owns the transitions;
no other file changes the player state directly.

- **Idle / Walk** — horizontal D-pad input.
- **Jump** — Arcade Physics gravity, single jump. There is no double jump.
- **Crouch** — the down direction. It shrinks the hitbox to dodge high attacks, and
  **Muri does not move while crouched**: the posture is defensive, with no half speed and
  no crouch-walk. The owner replaced the original "fits through low gaps" purpose, so no
  phase has a passage that requires crouching and nothing ever forces the posture on the
  player; `system-design.md` §5 still describes the old purpose and this rule wins.
- **AttackMelee** — short hitbox in front of Muri, unlimited use, kills any enemy in one
  hit.
- **AttackRanged** — spawns a projectile forward and consumes one ammo.
- **Defend** — reduces incoming damage partially and is **not** blocking: the player
  keeps moving while guarding.
- **Hurt** — contact with an enemy costs one heart. There is **no knockback and no
  invincibility frames**; the `Hurt` state is visual feedback only.
- **Dead** — zero hearts, or falling out of the world. It is the one **terminal** state:
  reachable from every other state, leaving to none. A transition out of `Dead` is refused,
  and a second transition into it changes nothing. Only `GameOverScene` ends the attempt;
  see `gameplay-health.md` for the death beat.

Because there are no i-frames, a technical cooldown of 400 ms applies between hits from
the same enemy, so standing on a fireball cannot drain several hearts in a few frames.
This cooldown grants no visible invincibility and must not be rendered as a blink.

**Incorrect:**

```ts
// Knockback and i-frames are explicitly not part of this game.
player.setVelocityX(-300);
player.invulnerableUntil = now + 1000;
```

**Correct:**

```ts
if (now - this.lastHitFrom.get(enemy.id) >= gameConfig.combat.damageCooldownMs) {
  this.health.loseHeart();
  this.state.set('Hurt');
}
```

Reference: `.agents/docs/system-design.md` §5
