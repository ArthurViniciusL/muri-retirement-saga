import type Phaser from 'phaser';
import { gameConfig } from '@/config/gameConfig';
import { debugText } from '@/data/debugText';
import type { PlayerState } from '@/systems/PlayerStateMachine';
import { PixelFont } from '@/ui/PixelFont';

const SCALE = 2;
const DEPTH = 1001;

export class DebugOverlay {
  private readonly text: Phaser.GameObjects.BitmapText;

  public constructor(scene: Phaser.Scene) {
    const { margin, iconHeight, rowGap } = gameConfig.hud;
    this.text = scene.add
      .bitmapText(margin, margin + (iconHeight + rowGap) * 2, PixelFont.keyFor('ink'), '', PixelFont.sizeFor(SCALE))
      .setScrollFactor(0)
      .setDepth(DEPTH);
  }

  public render(state: PlayerState): void {
    this.text.setText(debugText.line(state));
  }
}
