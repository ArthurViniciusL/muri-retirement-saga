import Phaser from 'phaser';
import { gameConfig } from '@/config/gameConfig';
import { buttonTextureKey } from '@/systems/PlaceholderTextures';

const DEPTH = 1000;

export class PauseButton {
  private readonly scene: Phaser.Scene;
  private readonly image: Phaser.GameObjects.Image;

  public constructor(scene: Phaser.Scene, onPress: () => void) {
    this.scene = scene;
    const { pauseSize, pauseHitSize } = gameConfig.controls;
    const inset = (pauseHitSize - pauseSize) / 2;
    this.image = scene.add
      .image(0, 0, buttonTextureKey('pause', false))
      .setScrollFactor(0)
      .setDepth(DEPTH)
      .setInteractive(new Phaser.Geom.Rectangle(-inset, -inset, pauseHitSize, pauseHitSize), Phaser.Geom.Rectangle.Contains);

    this.image.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => this.setPressed(true));
    this.image.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => this.setPressed(false));
    this.image.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
      this.setPressed(false);
      onPress();
    });
    this.layout();
  }

  public layout(): void {
    const { margin, pauseSize } = gameConfig.controls;
    const { width } = this.scene.scale.gameSize;
    this.image.setPosition(width - margin - pauseSize / 2, margin + pauseSize / 2);
  }

  private setPressed(pressed: boolean): void {
    this.image.setTexture(buttonTextureKey('pause', pressed));
  }
}
