import type Phaser from 'phaser';
import { gameConfig } from '@/config/gameConfig';

export const enemyAnimationKeys = {
  batFly: 'bat_fly',
  batDefeat: 'bat_defeat',
  fireballMove: 'fireball_move',
  fireballDefeat: 'fireball_defeat',
} as const;

const frameUrls = import.meta.glob<string>('../assets/sprites/{bat,fireball}/*_*_*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

const enemyFrames = Object.keys(frameUrls)
  .sort()
  .map((path) => ({ key: path.slice(path.lastIndexOf('/') + 1, -'.png'.length), url: frameUrls[path] ?? '' }));

export class EnemyAnimations {
  public static preload(loader: Phaser.Loader.LoaderPlugin): void {
    enemyFrames.forEach(({ key, url }) => loader.image(key, url));
  }

  public static register(scene: Phaser.Scene): void {
    const { bat, fireball } = gameConfig.enemies;
    EnemyAnimations.create(scene, enemyAnimationKeys.batFly, bat.flyFps, -1);
    EnemyAnimations.create(scene, enemyAnimationKeys.batDefeat, bat.defeatFps, 0);
    EnemyAnimations.create(scene, enemyAnimationKeys.fireballMove, fireball.moveFps, -1);
    EnemyAnimations.create(scene, enemyAnimationKeys.fireballDefeat, fireball.defeatFps, 0);
  }

  private static create(scene: Phaser.Scene, key: string, frameRate: number, repeat: number): void {
    const frames = enemyFrames.filter((frame) => frame.key.startsWith(`${key}_`) && scene.textures.exists(frame.key));
    if (frames.length > 0 && !scene.anims.exists(key)) {
      scene.anims.create({ key, frames: frames.map((frame) => ({ key: frame.key })), frameRate, repeat });
    }
  }
}
