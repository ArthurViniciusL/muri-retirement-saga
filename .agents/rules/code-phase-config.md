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
  scenery: PhaseScenery;                     // added: tileset key and the two tile families
  decoration: PhaseDecoration;               // added: seed, ground props, cloud prop
  parallax: PhaseParallax;                   // added: sky and hill tones
  enemySpawns: EnemySpawn[];
  thiefEncounters: ThiefEncounter[];
  ammoPickups: { x: number; y: number }[];   // added
  puzzleThemeKey: 'instrumentos' | 'xbox' | 'moedas';
  puzzleTriggerZone: { x: number; y: number; width: number; height: number };
  essentialItem: string;
}
```

Common coins and scenery obstacles are the exception: they are placed in the Tiled map,
in object layers named `coins` and `obstacles`, not in this config. A phase carries
dozens of them, and they are positioned against the visible scenery. Each obstacle
object carries its asset key as its type; the classification is in
`gameplay-scenery-obstacles.md`.

Decoration is neither in the config nor in the map. `decoration.seed` is a fixed string
per phase, `decoration.clusterAround` names the obstacle the bushes grow around, and the
scatter is computed from both at runtime, so every guest sees the same
phase without hundreds of props in the map file.

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
