import Phaser from 'phaser';
import { gsap } from 'gsap';
import { phaseSelectText } from '@/data/phaseSelectText';
import { MenuMusic } from '@/systems/MenuMusic';
import { PHASES, PhaseProgress, type PhaseNumber } from '@/systems/PhaseProgress';
import { UiSound } from '@/systems/UiSound';
import { Motion } from '@/ui/Motion';
import { PhasePlate } from '@/ui/PhasePlate';
import { PixelFont } from '@/ui/PixelFont';
import { SeraButton } from '@/ui/SeraButton';
import { SeraToast } from '@/ui/SeraToast';

const TITLE_SCALE = 4;
const DESCRIPTION_SCALE = 3;
const GAP_TITLE_TO_DESCRIPTION = 24;
const GAP_DESCRIPTION_TO_PLATES = 48;
const GAP_BETWEEN_PLATES = 64;
const BACK_MARGIN = 32;

const INTRO = {
  delay: 0.1,
  stampDuration: 0.28,
  stampFromScale: 1.3,
  stampStagger: 0.08,
  shakeMs: 120,
  shakeIntensity: 0.005,
} as const;

export interface PhaseSelectData {
  relayout?: boolean;
}

export class PhaseSelectScene extends Phaser.Scene {
  private plates: readonly PhasePlate[] = [];
  private toast: SeraToast | undefined;
  private focusIndex = 0;
  private leaving = false;
  private relayout = false;
  private intro: gsap.core.Timeline | undefined;

  public constructor() {
    super('PhaseSelectScene');
  }

  public init(data: PhaseSelectData): void {
    this.relayout = data.relayout === true;
    this.leaving = false;
  }

  public create(): void {
    this.plates = this.layout();
    this.toast = new SeraToast(this);
    this.setFocus(PHASES.indexOf(PhaseProgress.focusTarget()));

    if (!Motion.isReduced()) {
      if (this.relayout) {
        this.startPulses();
      } else {
        this.playIntro();
      }
    }

    MenuMusic.start(this);
    this.bindKeys();

    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize, this);
      this.intro?.kill();
      this.intro = undefined;
    });
  }

  private layout(): readonly PhasePlate[] {
    const { width, height } = this.scale.gameSize;
    const centerX = Math.round(width / 2);

    const title = this.add
      .bitmapText(centerX, 0, PixelFont.keyFor(900), phaseSelectText.title, PixelFont.sizeFor(TITLE_SCALE))
      .setOrigin(0.5, 0);
    const description = this.add
      .bitmapText(centerX, 0, PixelFont.keyFor(900), phaseSelectText.description, PixelFont.sizeFor(DESCRIPTION_SCALE))
      .setOrigin(0.5, 0);

    const stackHeight =
      title.height + GAP_TITLE_TO_DESCRIPTION + description.height + GAP_DESCRIPTION_TO_PLATES + PhasePlate.size;
    const top = Math.round((height - stackHeight) / 2);
    title.setY(top);
    description.setY(Math.round(title.y + title.height + GAP_TITLE_TO_DESCRIPTION));

    const platesTop = description.y + description.height + GAP_DESCRIPTION_TO_PLATES;
    const platesCenterY = Math.round(platesTop + PhasePlate.size / 2);
    const pitch = PhasePlate.size + GAP_BETWEEN_PLATES;
    const firstCenterX = centerX - pitch * ((PHASES.length - 1) / 2);
    const plates = PHASES.map(
      (phase, index) =>
        new PhasePlate(this, {
          centerX: Math.round(firstCenterX + pitch * index),
          centerY: platesCenterY,
          phase,
          state: PhaseProgress.stateOf(phase),
          onPress: () => {
            this.setFocus(index);
            this.activate(index);
          },
        }),
    );

    const back = new SeraButton(this, {
      centerX: 0,
      top: BACK_MARGIN,
      label: phaseSelectText.backLabel,
      variant: 'outline',
      onPress: () => this.goBack(),
    });
    back.setX(BACK_MARGIN + back.width / 2);

    return plates;
  }

  private bindKeys(): void {
    const keyboard = this.input.keyboard;
    keyboard?.on('keydown-LEFT', () => this.setFocus(this.focusIndex - 1));
    keyboard?.on('keydown-RIGHT', () => this.setFocus(this.focusIndex + 1));
    keyboard?.on('keydown-ENTER', () => this.activate(this.focusIndex));
    keyboard?.on('keydown-SPACE', () => this.activate(this.focusIndex));
    keyboard?.on('keydown-ESC', () => this.goBack());
    keyboard?.on('keydown-BACKSPACE', () => this.goBack());
  }

  private setFocus(index: number): void {
    this.focusIndex = Phaser.Math.Clamp(index, 0, this.plates.length - 1);
    this.plates.forEach((plate, i) => plate.setFocused(i === this.focusIndex));
  }

  private activate(index: number): void {
    const plate = this.plates[index];
    if (!plate || this.leaving) {
      return;
    }
    UiSound.click(this);
    if (plate.phaseState === 'locked') {
      this.refuseLocked(plate);
    } else {
      this.startPhase(plate.phase);
    }
  }

  private refuseLocked(plate: PhasePlate): void {
    plate.shakeLock();
    const previous = PhaseProgress.previousOf(plate.phase);
    if (previous !== undefined) {
      this.toast?.show(phaseSelectText.lockedToast(previous));
    }
  }

  private startPhase(phase: PhaseNumber): void {
    this.leaving = true;
    MenuMusic.stop();
    this.scene.start(PhaseProgress.sceneKeyOf(phase));
  }

  private goBack(): void {
    if (this.leaving) {
      return;
    }
    this.leaving = true;
    UiSound.click(this);
    this.scene.start('MenuScene');
  }

  private handleResize(): void {
    if (!this.leaving) {
      const data: PhaseSelectData = { relayout: true };
      this.scene.restart(data);
    }
  }

  private startPulses(): void {
    this.plates.filter((plate) => plate.phaseState === 'unlocked').forEach((plate) => plate.startPulse());
  }

  private playIntro(): void {
    const intro = gsap.timeline({ delay: INTRO.delay, onComplete: () => this.startPulses() });
    this.plates.forEach((plate, index) => {
      const at = index * INTRO.stampStagger;
      plate.setVisible(false);
      intro
        .set(plate, { visible: true }, at)
        .from(plate, { scale: INTRO.stampFromScale, duration: INTRO.stampDuration, ease: 'power4.in' }, at);
    });
    intro.call(() => this.cameras.main.shake(INTRO.shakeMs, INTRO.shakeIntensity));
    this.intro = intro;
  }
}
