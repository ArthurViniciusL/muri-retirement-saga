import Phaser from 'phaser';
import { gameOverText } from '@/data/gameOverText';
import type { PhaseOverlayData } from '@/scenes/PhaseScene';
import { UiSound } from '@/systems/UiSound';
import { OverlayPanel } from '@/ui/OverlayPanel';

export class GameOverScene extends Phaser.Scene {
  private phaseKey = '';
  private leaving = false;

  public constructor() {
    super('GameOverScene');
  }

  public init(data: PhaseOverlayData): void {
    this.phaseKey = data.phaseKey;
    this.leaving = false;
  }

  public create(): void {
    OverlayPanel.build(this, gameOverText.title, [
      { label: gameOverText.retryLabel, onPress: () => this.leave(() => this.retry()) },
      { label: gameOverText.backLabel, onPress: () => this.leave(() => this.backToSelect()) },
    ]);
    this.input.keyboard?.on('keydown-ENTER', () => this.leave(() => this.retry()));
    this.input.keyboard?.on('keydown-SPACE', () => this.leave(() => this.retry()));
    this.input.keyboard?.on('keydown-ESC', () => this.leave(() => this.backToSelect()));

    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    });
  }

  private leave(action: () => void): void {
    if (this.leaving) {
      return;
    }
    this.leaving = true;
    UiSound.click(this);
    action();
  }

  private retry(): void {
    this.scene.start(this.phaseKey);
  }

  private backToSelect(): void {
    this.scene.stop(this.phaseKey);
    this.scene.start('PhaseSelectScene', { relayout: true });
  }

  private handleResize(): void {
    if (!this.leaving) {
      const data: PhaseOverlayData = { phaseKey: this.phaseKey };
      this.scene.restart(data);
    }
  }
}
