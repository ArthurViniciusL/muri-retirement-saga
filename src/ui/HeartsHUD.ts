import type Phaser from 'phaser';
import heartFullPng from '@/assets/sprites/heart/ui_heart_full.png';
import heartHalfPng from '@/assets/sprites/heart/ui_heart_half.png';
import heartEmptyPng from '@/assets/sprites/heart/ui_heart_empty.png';
import { gameConfig } from '@/config/gameConfig';
import { Motion } from '@/ui/Motion';

const FULL = 'ui_heart_full';
const HALF = 'ui_heart_half';
const EMPTY = 'ui_heart_empty';
const DEPTH = 1001;

export class HeartsHUD {
  private readonly scene: Phaser.Scene;
  private readonly hearts: Phaser.GameObjects.Image[] = [];
  private remaining: number = gameConfig.combat.maxHearts;

  public static preload(loader: Phaser.Loader.LoaderPlugin): void {
    loader.image(FULL, heartFullPng);
    loader.image(HALF, heartHalfPng);
    loader.image(EMPTY, heartEmptyPng);
  }

  public constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const { margin, iconWidth, iconHeight, iconGap } = gameConfig.hud;
    for (let index = 0; index < gameConfig.combat.maxHearts; index += 1) {
      const heart = scene.add
        .image(margin + index * (iconWidth + iconGap) + iconWidth / 2, margin + iconHeight / 2, FULL)
        .setOrigin(0.5, 0.5)
        .setDisplaySize(iconWidth, iconHeight)
        .setScrollFactor(0)
        .setDepth(DEPTH);
      this.hearts.push(heart);
    }
  }

  public render(remaining: number): void {
    if (remaining === this.remaining) {
      return;
    }
    for (let index = remaining; index < this.remaining; index += 1) {
      this.empty(index);
    }
    for (let index = this.remaining; index < remaining; index += 1) {
      this.hearts[index]?.setTexture(FULL);
    }
    this.remaining = remaining;
  }

  /** O quadro pela metade é o passo do meio da perda: sem ele a troca some no susto. */
  private empty(index: number): void {
    const heart = this.hearts[index];
    if (!heart) {
      return;
    }
    const { heartFlashMs, heartPulseMs, heartPulseScale, iconWidth, iconHeight } = gameConfig.hud;

    if (Motion.isReduced()) {
      heart.setTexture(EMPTY);
      return;
    }

    heart.setTexture(HALF);
    this.scene.time.delayedCall(heartFlashMs, () => heart.setTexture(EMPTY));
    this.scene.tweens.add({
      targets: heart,
      displayWidth: iconWidth * heartPulseScale,
      displayHeight: iconHeight * heartPulseScale,
      duration: heartPulseMs / 2,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
  }
}
