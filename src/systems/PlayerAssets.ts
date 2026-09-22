import type Phaser from 'phaser';
import idleFrame01Png from '@/assets/muri/stoped/stoped_001.png';
import idleFrame02Png from '@/assets/muri/stoped/stoped_002.png';
import { gameConfig } from '@/config/gameConfig';

const IDLE_FRAME_01 = 'muri_idle_01';
const IDLE_FRAME_02 = 'muri_idle_02';
const IDLE_ANIMATION = 'muri_idle';
const MS_PER_SECOND = 1000;

export class PlayerAssets {
  public static readonly idleAnimation = IDLE_ANIMATION;
  public static readonly idleFirstFrame = IDLE_FRAME_01;

  public static preload(loader: Phaser.Loader.LoaderPlugin): void {
    loader.image(IDLE_FRAME_01, idleFrame01Png);
    loader.image(IDLE_FRAME_02, idleFrame02Png);
  }

  // Quadros separados, nunca um atlas aparado: o 02 tem 7 px de topo transparente e o
  // recorte por quadro encolheria o desenho, afundando os pés do Muri no chão.
  public static registerAnimations(anims: Phaser.Animations.AnimationManager): void {
    if (anims.exists(IDLE_ANIMATION)) {
      return;
    }
    const { frameDurationMs, repeat } = gameConfig.player.animations.idle;
    anims.create({
      key: IDLE_ANIMATION,
      frames: [{ key: IDLE_FRAME_01 }, { key: IDLE_FRAME_02 }],
      frameRate: MS_PER_SECOND / frameDurationMs,
      repeat,
    });
  }
}
