/**
 * PreloadScene — carga completa de conteúdo.
 *
 * Responsabilidade: carregar sprites/atlas, tilemaps (Tiled JSON) e áudio de todas
 * as fases, registrar as animações e seguir para a MenuScene ao concluir.
 *
 * Referência: System Design §3 (Arquitetura de cenas), §16 (Pipeline de assets).
 */
import Phaser from 'phaser';
import { palette } from '@/config/palette';
import { UiSound } from '@/systems/UiSound';

const BAR_WIDTH = 384;
const BAR_HEIGHT = 16;
const BAR_BORDER = 4;

export class PreloadScene extends Phaser.Scene {
  public constructor() {
    super('PreloadScene');
  }

  public preload(): void {
    const { width, height } = this.scale.gameSize;
    const x = Math.round((width - BAR_WIDTH) / 2);
    const y = Math.round((height - BAR_HEIGHT) / 2);

    const frame = this.add.graphics();
    frame.fillStyle(palette.ink, 1);
    frame.fillRect(x - BAR_BORDER, y - BAR_BORDER, BAR_WIDTH + BAR_BORDER * 2, BAR_HEIGHT + BAR_BORDER * 2);
    frame.fillStyle(palette.bone, 1);
    frame.fillRect(x, y, BAR_WIDTH, BAR_HEIGHT);

    const fill = this.add.graphics();
    this.load.on(Phaser.Loader.Events.PROGRESS, (progress: number) => {
      fill.clear();
      fill.fillStyle(palette.ink, 1);
      fill.fillRect(x, y, Math.round(BAR_WIDTH * progress), BAR_HEIGHT);
    });

    UiSound.preload(this.load);
    // Ainda não há assets de fase; sprites, tilemaps e o resto da 1ª onda de áudio entram aqui.
  }

  public create(): void {
    this.scene.start('MenuScene');
  }
}
