import Phaser from 'phaser';
import { pauseText } from '@/data/pauseText';
import type { PhaseOverlayData } from '@/scenes/PhaseScene';
import { UiSound } from '@/systems/UiSound';
import { OverlayPanel } from '@/ui/OverlayPanel';

export class PauseScene extends Phaser.Scene {
  private phaseKey = '';
  private leaving = false;

  public constructor() {
    super('PauseScene');
  }

  public init(data: PhaseOverlayData): void {
    this.phaseKey = data.phaseKey;
    this.leaving = false;
  }

  public create(): void {
    OverlayPanel.build(this, pauseText.title, [
      { label: pauseText.continueLabel, onPress: () => this.leave(() => this.resumePhase()) },
      { label: pauseText.restartLabel, onPress: () => this.leave(() => this.scene.start(this.phaseKey)) },
      { label: pauseText.backLabel, onPress: () => this.leave(() => this.backToSelect()) },
    ]);
    this.input.keyboard?.on('keydown-ESC', () => this.leave(() => this.resumePhase()));
    this.input.keyboard?.on('keydown-P', () => this.leave(() => this.resumePhase()));

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

  private resumePhase(): void {
    this.scene.resume(this.phaseKey);
    this.scene.stop();
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
