/**
 * HeartsHUD — indicador de vida.
 *
 * Responsabilidade: renderizar os 5 corações em estética xilogravura (cheio/vazio),
 * refletindo o estado do HealthSystem. Camada própria por cima da cena, com contorno
 * próprio e sem depender de opacidade para se destacar do cenário.
 *
 * Referência: System Design §7 (Sistema de vida); Guia de Estilo §7 (UI / HUD).
 */
import type Phaser from 'phaser';
import { gameConfig } from '@/config/gameConfig';
import { textureKeys } from '@/systems/PlaceholderTextures';

const DEPTH = 1000;

export class HeartsHUD {
  private readonly icons: Phaser.GameObjects.Image[];

  public constructor(scene: Phaser.Scene, max: number) {
    const { margin, iconSize, iconGap } = gameConfig.hud;
    this.icons = Array.from({ length: max }, (_, index) =>
      scene.add
        .image(margin + index * (iconSize + iconGap), margin, textureKeys.heartFull)
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDepth(DEPTH),
    );
  }

  public render(hearts: number): void {
    this.icons.forEach((icon, index) => icon.setTexture(index < hearts ? textureKeys.heartFull : textureKeys.heartEmpty));
  }
}
