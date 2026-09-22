---
title: Level Design Progression and Where Tuning Lives
impact: MEDIUM
impactDescription: keeps difficulty adjustable after the first playtest
tags: content, level-design, tuning
---

## Level Design Progression and Where Tuning Lives

Three phases, strictly linear, with rising difficulty: Phase 1 teaches, Phase 3 is the
climax before the beach ending.

| | Phase 1 — Instruments | Phase 2 — Xbox | Phase 3 — Coins |
| --- | --- | --- | --- |
| Length | short | medium | longest |
| Enemies | 3 bats, 2 wild cats | 4 bats, 3 wild cats, 2 fireballs | 5 bats, 4 wild cats, 3 fireballs |
| Fireballs | none (introduced in Phase 2) | first appearance | densest |
| Ammo pickups | 2, obvious, on the main path | 2, spaced out | spaced out, strategic |
| Coins | main path plus low-risk detours | hidden, some risky detours | abundant, on theme |
| Thief | Maryana, one encounter | Mayra, one or two | Weruska, one or two |
| Puzzle | instruments, near the end | Xbox, near the end | coins, near the end |
| Essential item | instrument | the three CDs as one item | retirement money |

Victory is completing the three phases in order and collecting the three essential
items, which opens `VictoryScene`. Common coins are secondary scoring only: they never
affect the victory condition, and the Phase 3 puzzle alone guarantees the retirement
money.

## Phase 1 baseline layout

Phase 1 is authored as 60×18 tiles of 64 px: 3840 px wide, 1152 px tall, with the ground
surface around row 15. It has one vertical section that takes the camera above the first
screen, one or two holes 2 tiles wide, each with at least 4 tiles of visible run-up and
never right after a jump that needs the full height, and nothing that forces a crouch.
Obstacles sit on the route, never in a spot that cannot be jumped, never taller than
96 px and never closer to each other than six tiles
(`gameplay-scenery-obstacles.md`). The rhythm matters more than the count: a phase with
seven well-spaced obstacles plays better than the same phase with twelve crowded ones.

**No phase has a low gap.** Crouching is defensive and immobile
(`gameplay-player-state-machine.md`), so a passage that can only be crossed crouched is
a passage that cannot be crossed. Ceilings stay at least two tiles above any surface the
player walks on.

A prop that depicts something with a known size — a car, a barrel, a log — is placed at
a size that reads against Muri, who is 64×96.

Nothing stands on a landing either: the four tiles past the far edge of a hole stay
clear, because a jump over a hole lands about three tiles in and the player cannot read
an obstacle while airborne.

**Every phase opens with a clear stretch.** The first ten tiles after the spawn carry no
obstacle: that is where the guest finds out what the buttons do, and the party lasts one
run, so nobody loses a heart before understanding the controls. Coins may sit there, and
usually should, because they teach the guest to walk forward.

While the health and game over work is not done, Phase 1 runs with two temporary
deviations, recorded so they read as scope and not as defects: hearts are a debug
counter that does not end the run at zero, and a fall below the world restarts the phase
instead of opening `GameOverScene`.

**All of these numbers are tuning.** They live in `phasesConfig.ts` and in the Tiled
maps, and they are expected to change after the first playtest. None of them may be
hardcoded in a scene. Enemy speed, detection range, patrol routes and exact ammo
placement are open by design — see `content-open-decisions.md`.

Reference: `.agents/docs/system-design.md` §12, §17, §18, §20
