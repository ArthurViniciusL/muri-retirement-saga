---
title: Phases Are Data, Not Code
impact: HIGH
impactDescription: lets content be tuned without touching scene logic
tags: code, configuration, level-design
---

## Phases Are Data, Not Code

Every phase is described by a `PhaseConfig` object in `src/config/phasesConfig.ts`. The
three phase scenes read that object and contain no phase-specific branching. The
interface extends the one in the design document with the fields the level design
actually needs:

```ts
interface PhaseConfig {
  id: string;
  tilemapKey: string;
  worldHeight: number;                       // added: world is taller than the screen
  playerSpawn: { x: number; y: number };     // added
  enemySpawns: EnemySpawn[];
  thiefEncounters: ThiefEncounter[];
  ammoPickups: { x: number; y: number }[];   // added
  puzzleThemeKey: 'instrumentos' | 'xbox' | 'moedas';
  puzzleTriggerZone: { x: number; y: number; width: number; height: number };
  essentialItem: string;
}
```

Common coins are the exception: they are placed in the Tiled map, in an object layer
named `coins`, not in this config. A phase carries dozens of coins, and they are
positioned against the visible scenery.

`puzzleThemeKey` values stay in Portuguese (`instrumentos`, `xbox`, `moedas`) because
they key into existing content files under `src/data/puzzleThemes/`.

**Incorrect:**

```ts
if (this.scene.key === 'Phase3Scene') {
  this.spawnFireballs(3);
}
```

**Correct:**

```ts
this.config.enemySpawns
  .filter((spawn) => spawn.type === 'fireball')
  .forEach((spawn) => new Fireball(this, spawn));
```

Reference: `.agents/docs/system-design.md` §13, §20
