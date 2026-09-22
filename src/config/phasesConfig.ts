export type EnemyType = 'bat' | 'wildcat' | 'fireball';
export type ThiefName = 'maryana' | 'mayra' | 'weruska';
export type PuzzleThemeKey = 'instrumentos' | 'xbox' | 'moedas';

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

export interface ThiefEncounter {
  thief: ThiefName;
  zone: WorldZone;
}

export interface PhaseConfig {
  id: string;
  tilemapKey: string;
  worldHeight: number;
  playerSpawn: WorldPoint;
  enemySpawns: readonly EnemySpawn[];
  thiefEncounters: readonly ThiefEncounter[];
  ammoPickups: readonly WorldPoint[];
  puzzleThemeKey: PuzzleThemeKey;
  puzzleTriggerZone: WorldZone;
  essentialItem: string;
}

export const phasesConfig = {
  phase1: {
    id: 'phase1',
    tilemapKey: 'phase1',
    worldHeight: 1152,
    playerSpawn: { x: 160, y: 960 },
    // `y` é a linha do chão sob o morcego. Os 2 gatos entram quando WildCat existir.
    enemySpawns: [
      { type: 'bat', x: 480, y: 960 },
      { type: 'bat', x: 1600, y: 960 },
      { type: 'bat', x: 3264, y: 960 },
      // Só para teste: a bola de fogo estreia na Fase 2 (gameplay-enemies.md) e sai
      // daqui quando a Phase2Scene existir.
      { type: 'fireball', x: 1100, y: 960 },
    ],
    thiefEncounters: [],
    ammoPickups: [],
    puzzleThemeKey: 'instrumentos',
    // Provisória: o trigger real entra no marco 5.
    puzzleTriggerZone: { x: 3648, y: 768, width: 128, height: 192 },
    essentialItem: 'instrumento',
  },
} as const satisfies Record<string, PhaseConfig>;
