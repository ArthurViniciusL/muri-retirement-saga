/**
 * BootScene — primeira cena do ciclo de vida do jogo.
 *
 * Responsabilidade: carregar apenas os assets essenciais para exibir a barra de
 * progresso e configurar o scale/orientação antes de delegar para a PreloadScene.
 * A fonte pixel é gerada aqui, porque a PreloadScene e o menu já escrevem com ela.
 *
 * Referência: System Design §3 (Arquitetura de cenas), §14 (landscape obrigatório).
 */
import Phaser from 'phaser';
import { PixelFont } from '@/ui/PixelFont';

export class BootScene extends Phaser.Scene {
  public constructor() {
    super('BootScene');
  }

  public create(): void {
    PixelFont.register(this, ['bone', 'ink', 'dust']);
    this.scene.start('PreloadScene');
  }
}
