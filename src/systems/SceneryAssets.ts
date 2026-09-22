import type Phaser from 'phaser';
import brickWallPng from '@/assets/sprites/ground/brick_wall.png';
import woodenWallPng from '@/assets/sprites/ground/wooden_wall.png';
import cactusPng from '@/assets/sprites/obstacles/cactus.png';
import cactusRedPng from '@/assets/sprites/obstacles/cactus_red.png';
import campfirePng from '@/assets/sprites/obstacles/campfire.png';
import rockFormationPng from '@/assets/sprites/obstacles/rock_formation.png';
import stoneRockPng from '@/assets/sprites/obstacles/stone_rock.png';
import woodenBarrelPng from '@/assets/sprites/obstacles/wooden_barrel.png';
import woodlogPng from '@/assets/sprites/obstacles/woodlog.png';
import foxCarPng from '@/assets/sprites/obstacles/fox_car.png';
import foliagePng from '@/assets/sprites/decoration/foliage.png';
import pebblePng from '@/assets/sprites/obstacles/pebble.png';
import fluffyCloudPng from '@/assets/sprites/decoration/fluffy_cloud.png';
import coinSpin01Png from '@/assets/sprites/coins/coin_spin_01.png';
import coinSpin02Png from '@/assets/sprites/coins/coin_spin_02.png';
import { gameConfig } from '@/config/gameConfig';
import type { SceneryKey } from '@/config/phasesConfig';

export const COIN_FRAME_KEYS = ['coin_spin_01', 'coin_spin_02'] as const;

export type SceneryImageKey = Exclude<SceneryKey, 'coin'>;

interface Framable {
  setDisplaySize(width: number, height: number): unknown;
}

const IMAGE_URLS: Record<SceneryImageKey, string> = {
  brick_wall: brickWallPng,
  wooden_wall: woodenWallPng,
  cactus: cactusPng,
  cactus_red: cactusRedPng,
  campfire: campfirePng,
  rock_formation: rockFormationPng,
  stone_rock: stoneRockPng,
  wooden_barrel: woodenBarrelPng,
  woodlog: woodlogPng,
  fox_car: foxCarPng,
  foliage: foliagePng,
  pebble: pebblePng,
  fluffy_cloud: fluffyCloudPng,
};

const COIN_URLS: Record<(typeof COIN_FRAME_KEYS)[number], string> = {
  coin_spin_01: coinSpin01Png,
  coin_spin_02: coinSpin02Png,
};

export class SceneryAssets {
  public static preload(loader: Phaser.Loader.LoaderPlugin): void {
    for (const [key, url] of Object.entries({ ...IMAGE_URLS, ...COIN_URLS })) {
      loader.image(key, url);
    }
  }

  /** Nenhum asset foi desenhado no grid de 64; a tabela de enquadramento é a fonte. */
  public static frame<T extends Framable>(target: T, key: SceneryKey): T {
    const { width, height } = gameConfig.scenery.targets[key];
    target.setDisplaySize(width, height);
    return target;
  }
}
