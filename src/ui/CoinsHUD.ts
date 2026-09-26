import type Phaser from 'phaser';
import { gameConfig } from '@/config/gameConfig';
import { COIN_FRAME_KEYS } from '@/systems/SceneryAssets';
import { Motion } from '@/ui/Motion';
import { PixelFont } from '@/ui/PixelFont';

const DEPTH = 1001;
const TEXT_SCALE = 2;

export class CoinsHUD {
  private readonly scene: Phaser.Scene;
  private readonly icon: Phaser.GameObjects.Image;
  private readonly total: Phaser.GameObjects.BitmapText;
  private collected = 0;

  public constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const { margin, iconWidth, iconHeight, iconGap } = gameConfig.hud;
    // A moeda é quadrada: esticá-la na altura do coração a deixaria ovalada.
    const coin = gameConfig.scenery.coinSize;

    this.icon = scene.add
      .image(margin + iconWidth / 2, margin + iconHeight / 2, COIN_FRAME_KEYS[0])
      .setOrigin(0.5, 0.5)
      .setDisplaySize(coin, coin)
      .setScrollFactor(0)
      .setDepth(DEPTH);

    this.total = scene.add
      .bitmapText(
        margin + iconWidth + iconGap,
        margin + iconHeight / 2,
        PixelFont.keyFor('ink'),
        '0',
        PixelFont.sizeFor(TEXT_SCALE),
      )
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(DEPTH);
  }

  /** O HUD de vida ocupa o canto esquerdo: as moedas descem uma linha. */
  public layout(offsetY: number): void {
    const { margin, iconHeight } = gameConfig.hud;
    this.icon.setY(margin + offsetY + iconHeight / 2);
    this.total.setY(margin + offsetY + iconHeight / 2);
  }

  public render(collected: number): void {
    if (collected === this.collected) {
      return;
    }
    const gained = collected > this.collected;
    this.collected = collected;
    this.total.setText(String(collected));
    if (gained) {
      this.pulse();
    }
  }

  /** A moeda some do mundo ao ser pega; o pulo do ícone diz para onde ela foi. */
  private pulse(): void {
    if (Motion.isReduced()) {
      return;
    }
    const { coinPulseMs, coinPulseScale } = gameConfig.hud;
    const coin = gameConfig.scenery.coinSize;
    this.scene.tweens.add({
      targets: this.icon,
      displayWidth: coin * coinPulseScale,
      displayHeight: coin * coinPulseScale,
      duration: coinPulseMs / 2,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
  }
}
