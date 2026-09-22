/**
 * PreloadScene — carga completa de conteúdo.
 *
 * Responsabilidade: carregar sprites/atlas, tilemaps (Tiled JSON) e áudio de todas
 * as fases, registrar as animações e seguir para a MenuScene ao concluir.
 *
 * Referência: System Design §3 (Arquitetura de cenas), §16 (Pipeline de assets).
 */
import Phaser from 'phaser';
import phase1MapUrl from '@/assets/tilemaps/phase1.json?url';
import { palette } from '@/config/palette';
import { ControlTextures } from '@/systems/ControlTextures';
import { DebugTextures } from '@/systems/DebugTextures';
import { PlayerAssets } from '@/systems/PlayerAssets';
import { SceneryAssets } from '@/systems/SceneryAssets';
import { UiSound } from '@/systems/UiSound';
import { HeartsHUD } from '@/ui/HeartsHUD';

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
    SceneryAssets.preload(this.load);
    PlayerAssets.preload(this.load);
    HeartsHUD.preload(this.load);
    this.load.tilemapTiledJSON('phase1', phase1MapUrl);
  }

  public create(): void {
    ControlTextures.generate(this);
    DebugTextures.generate(this);
    PlayerAssets.registerAnimations(this.anims);
    this.scene.start('MenuScene');
  }
}
