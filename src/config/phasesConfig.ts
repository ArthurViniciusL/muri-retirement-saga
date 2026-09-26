/**
 * phasesConfig — dados de cada fase.
 *
 * Responsabilidade: descrever as três fases como dados (tilemap, spawn, cenário,
 * decoração, parallax, inimigos, ladras, munição, puzzle e item essencial). As cenas
 * de fase leem este objeto e não contêm nenhuma decisão específica de fase.
 *
 * Referência: System Design §13 (PhaseConfig), §20 (Level design).
 */
import type { PaletteTone } from '@/config/palette';
import type { gameConfig } from '@/config/gameConfig';

export type SceneryKey = keyof typeof gameConfig.scenery.targets;

export type TileFamilyKey = keyof typeof gameConfig.scenery.sourceUpscale;

export type PuzzleThemeKey = 'instrumentos' | 'xbox' | 'moedas';

export type EnemyType = 'bat' | 'wildcat' | 'fireball';

export type ThiefName = 'maryana' | 'mayra' | 'weruska';

export interface WorldPoint {
  x: number;
  y: number;
}

export interface WorldZone extends WorldPoint {
  width: number;
  height: number;
}

export interface EnemySpawn extends WorldPoint {
  type: EnemyType;
}

export interface ThiefEncounter extends WorldPoint {
  name: ThiefName;
  coinShare: number;
}

export interface PhaseScenery {
  tilesetKey: string;
  groundTile: TileFamilyKey;
  platformTile: TileFamilyKey;
}

export interface PhaseDecoration {
  seed: string;
  groundKinds: readonly SceneryKey[];
  /** Os arbustos crescem em volta deste obstáculo, nunca soltos pela rota. */
  clusterAround: SceneryKey;
  cloudKind: SceneryKey;
}

export interface PhaseParallax {
  skyTone: PaletteTone;
  hillTone: PaletteTone;
  hillOutlineTone: PaletteTone;
}

export interface PhaseConfig {
  id: string;
  tilemapKey: string;
  worldHeight: number;
  playerSpawn: WorldPoint;
  scenery: PhaseScenery;
  decoration: PhaseDecoration;
  parallax: PhaseParallax;
  enemySpawns: readonly EnemySpawn[];
  thiefEncounters: readonly ThiefEncounter[];
  ammoPickups: readonly WorldPoint[];
  puzzleThemeKey: PuzzleThemeKey;
  puzzleTriggerZone: WorldZone;
  essentialItem: string;
}

const phase1: PhaseConfig = {
  id: 'phase1',
  tilemapKey: 'phase1',
  worldHeight: 1152,
  playerSpawn: { x: 160, y: 960 },
  scenery: {
    tilesetKey: 'tiles_phase1',
    groundTile: 'brick_wall',
    platformTile: 'wooden_wall',
  },
  decoration: {
    seed: 'phase1-decoration',
    groundKinds: ['foliage'],
    clusterAround: 'cactus',
    cloudKind: 'fluffy_cloud',
  },
  parallax: {
    skyTone: 'bone',
    hillTone: 'clay',
    hillOutlineTone: 'sertao',
  },
  enemySpawns: [],
  thiefEncounters: [],
  ammoPickups: [],
  puzzleThemeKey: 'instrumentos',
  puzzleTriggerZone: { x: 3520, y: 832, width: 128, height: 128 },
  essentialItem: 'instrumento',
};

export const phasesConfig = { phase1 } as const;
