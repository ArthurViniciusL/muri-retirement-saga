import type Phaser from 'phaser';
import type { SceneryKey } from '@/config/phasesConfig';
import { SceneryAssets } from '@/systems/SceneryAssets';

export type ObstacleKind = 'hurts' | 'blocks';

const KINDS: Record<string, ObstacleKind> = {
  cactus: 'blocks',
  cactus_red: 'hurts',
  campfire: 'hurts',
  rock_formation: 'blocks',
  stone_rock: 'blocks',
  wooden_barrel: 'blocks',
  woodlog: 'blocks',
  pebble: 'blocks',
  fox_car: 'blocks',
};

export function obstacleKindOf(type: string): ObstacleKind | undefined {
  return KINDS[type];
}

export class Obstacle {
  /** O objeto do Tiled vem ancorado no chão: origem (0.5, 1) casa com isso. */
  public static create(
    group: Phaser.Physics.Arcade.StaticGroup,
    key: SceneryKey,
    x: number,
    y: number,
  ): Phaser.Physics.Arcade.Image {
    const image: Phaser.Physics.Arcade.Image = group.create(x, y, key);
    image.setOrigin(0.5, 1);
    image.setName(`${key}_${x}_${y}`);
    SceneryAssets.frame(image, key);
    image.refreshBody();
    return image;
  }
}
