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

Holes are allowed. Falling below the bottom of the world kills Muri at once and opens
`GameOverScene`; hearts do not soften it. Because a fall is fatal, a hole is never
placed right after a vertical section or right after a jump that needs the full jump
height, and the far edge of every hole is visible before Muri reaches the near edge.
Phase 1 has one or two holes, 2 tiles wide.

**All of these numbers are tuning.** They live in `phasesConfig.ts` and in the Tiled
maps, and they are expected to change after the first playtest. None of them may be
hardcoded in a scene. Enemy speed, detection range, patrol routes and exact ammo
placement are open by design — see `content-open-decisions.md`.

Reference: `.agents/docs/system-design.md` §12, §17, §18, §20
