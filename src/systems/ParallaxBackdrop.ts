import Phaser from 'phaser';
import { gameConfig } from '@/config/gameConfig';
import { palette } from '@/config/palette';
import type { PhaseConfig } from '@/config/phasesConfig';

const DEPTH = -10;

export class ParallaxBackdrop {
  /**
   * A camada média ainda não tem arte: são morros gerados na paleta, com a mesma
   * silhueta chapada do resto do cenário.
   */
  public static create(scene: Phaser.Scene, config: PhaseConfig, worldWidth: number): void {
    const { parallax } = gameConfig.scenery;
    const height = gameConfig.render.logicalHeight;
    const rng = new Phaser.Math.RandomDataGenerator([`${config.decoration.seed}-hills`]);
    const graphics = scene.add.graphics();

    graphics.setScrollFactor(parallax.midScrollFactor).setDepth(DEPTH);
    const span = worldWidth * parallax.midScrollFactor + gameConfig.render.maxLogicalWidth;
    for (let index = 0; index < parallax.hillCount; index += 1) {
      const width = rng.between(parallax.hillMinWidth, parallax.hillMaxWidth);
      const peak = rng.between(parallax.hillMinHeight, parallax.hillMaxHeight);
      const centerX = Math.round((span / parallax.hillCount) * index + rng.between(0, parallax.hillMinWidth));
      graphics.fillStyle(palette[config.parallax.hillOutlineTone], 1);
      graphics.fillTriangle(centerX - width / 2, height, centerX, height - peak, centerX + width / 2, height);
      graphics.fillStyle(palette[config.parallax.hillTone], 1);
      graphics.fillTriangle(
        centerX - width / 2 + parallax.hillOutlineWidth,
        height,
        centerX,
        height - peak + parallax.hillOutlineWidth * 2,
        centerX + width / 2 - parallax.hillOutlineWidth,
        height,
      );
    }
  }
}
