import Phaser from 'phaser';
import { gsap } from 'gsap';
import { paletteCss } from '@/config/palette';
import { gameOverText } from '@/data/gameOverText';
import type { PhaseSceneKey } from '@/systems/PhaseProgress';
import { UiSound } from '@/systems/UiSound';
import { Motion } from '@/ui/Motion';
import { PixelFont } from '@/ui/PixelFont';
import { SeraButton } from '@/ui/SeraButton';

const TITLE_SCALE = 4;
const DESCRIPTION_SCALE = 3;
const GAP_TITLE_TO_DESCRIPTION = 24;
const GAP_DESCRIPTION_TO_BUTTON = 48;

const INTRO = {
  delay: 0.1,
  stampDuration: 0.28,
  stampFromScale: 1.3,
  stampStagger: 0.08,
  shakeMs: 120,
  shakeIntensity: 0.005,
} as const;

const BUTTON_STAMP_INDEX = 2;

export interface GameOverData {
  phase: PhaseSceneKey;
  relayout?: boolean;
}

interface Stack {
  readonly title: Phaser.GameObjects.BitmapText;
  readonly description: Phaser.GameObjects.BitmapText;
  readonly button: SeraButton;
}

export class GameOverScene extends Phaser.Scene {
  private phase!: PhaseSceneKey;
  private leaving = false;
  private relayout = false;
  private intro: gsap.core.Timeline | undefined;

  public constructor() {
    super('GameOverScene');
  }

  public init(data: GameOverData): void {
    this.phase = data.phase;
    this.relayout = data.relayout === true;
    this.leaving = false;
  }

  public create(): void {
    this.cameras.main.setBackgroundColor(paletteCss('ink'));
    const stack = this.layout();

    if (!Motion.isReduced()) {
      if (this.relayout) {
        stack.button.startPulse();
      } else {
        this.playIntro(stack);
      }
    }

    this.bindKeys();

    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize, this);
      this.intro?.kill();
      this.intro = undefined;
    });
  }

  private layout(): Stack {
    const { width, height } = this.scale.gameSize;
    const centerX = Math.round(width / 2);

    const title = this.add
      .bitmapText(centerX, 0, PixelFont.keyFor('bone'), gameOverText.title, PixelFont.sizeFor(TITLE_SCALE))
      .setOrigin(0.5, 0);
    const description = this.add
      .bitmapText(centerX, 0, PixelFont.keyFor('dust'), gameOverText.description, PixelFont.sizeFor(DESCRIPTION_SCALE))
      .setOrigin(0.5, 0);

    const stackHeight =
      title.height + GAP_TITLE_TO_DESCRIPTION + description.height + GAP_DESCRIPTION_TO_BUTTON + SeraButton.height;
    const top = Math.round((height - stackHeight) / 2);
    title.setY(top);
    description.setY(Math.round(title.y + title.height + GAP_TITLE_TO_DESCRIPTION));

    const button = new SeraButton(this, {
      centerX,
      top: Math.round(description.y + description.height + GAP_DESCRIPTION_TO_BUTTON),
      label: gameOverText.retryLabel,
      onDark: true,
      onPress: () => this.restartPhase(),
    });

    return { title, description, button };
  }

  private bindKeys(): void {
    const keyboard = this.input.keyboard;
    keyboard?.on('keydown-ENTER', () => this.restartPhase());
    keyboard?.on('keydown-SPACE', () => this.restartPhase());
  }

  private restartPhase(): void {
    if (this.leaving) {
      return;
    }
    this.leaving = true;
    UiSound.click(this);
    this.scene.start(this.phase);
  }

  private handleResize(): void {
    if (!this.leaving) {
      const data: GameOverData = { phase: this.phase, relayout: true };
      this.scene.restart(data);
    }
  }

  /**
   * The button is never hidden and never starts scaled: an object that is invisible or
   * fully transparent leaves the Phaser hit test, and this one has to accept a tap from
   * the first frame. `immediateRender: false` holds its stamp until its turn.
   */
  private playIntro({ title, description, button }: Stack): void {
    const intro = gsap.timeline({ delay: INTRO.delay, onComplete: () => button.startPulse() });
    const stamp = { scale: INTRO.stampFromScale, duration: INTRO.stampDuration, ease: 'power4.in' };

    [title, description].forEach((text, index) => {
      const at = index * INTRO.stampStagger;
      text.setVisible(false);
      intro.set(text, { visible: true }, at).from(text, stamp, at);
    });
    intro
      .from(button, { ...stamp, immediateRender: false }, BUTTON_STAMP_INDEX * INTRO.stampStagger)
      .call(() => this.cameras.main.shake(INTRO.shakeMs, INTRO.shakeIntensity));

    this.intro = intro;
  }
}
