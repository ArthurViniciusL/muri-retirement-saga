import Phaser from 'phaser';
import { gsap } from 'gsap';
import { menuText } from '@/data/menuText';
import { MenuMusic } from '@/systems/MenuMusic';
import { UiSound } from '@/systems/UiSound';
import { Motion } from '@/ui/Motion';
import { PixelFont } from '@/ui/PixelFont';
import { SeraButton } from '@/ui/SeraButton';
import { TitlePlate } from '@/ui/TitlePlate';

const DESCRIPTION_SCALE = 3;
const DESCRIPTION_MAX_WIDTH = TitlePlate.width;
const GAP_PLATE_TO_DESCRIPTION = 36;
const GAP_DESCRIPTION_TO_BUTTON = 36;

const INTRO = {
  stampDelay: 0.15,
  stampDuration: 0.32,
  stampFromScale: 1.3,
  shakeMs: 140,
  shakeIntensity: 0.006,
  shadowDuration: 0.35,
  typingPerChar: 0.022,
  buttonPopAfterTypingStart: 0.6,
  buttonPopDuration: 0.45,
} as const;

// Uma vez por carga: girar o aparelho reinicia a cena, e repetir o carimbo seria ruído.
let introPlayed = false;

export class MenuScene extends Phaser.Scene {
  private leaving = false;
  private intro: gsap.core.Timeline | undefined;

  public constructor() {
    super('MenuScene');
  }

  public create(): void {
    this.leaving = false;
    const { plate, description, button } = this.layout();

    if (!Motion.isReduced()) {
      if (introPlayed) {
        button.startPulse();
      } else {
        this.playIntro(plate, description, button);
      }
    }
    introPlayed = true;

    MenuMusic.start(this);
    this.input.keyboard?.on('keydown-ENTER', () => this.openPhaseSelect());
    this.input.keyboard?.on('keydown-SPACE', () => this.openPhaseSelect());

    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize, this);
      this.intro?.kill();
      this.intro = undefined;
    });
  }

  private layout(): { plate: TitlePlate; description: Phaser.GameObjects.DynamicBitmapText; button: SeraButton } {
    const { width, height } = this.scale.gameSize;
    const centerX = Math.round(width / 2);

    // `DynamicBitmapText` esconde letra por letra sem refazer a quebra de linha: o texto
    // centralizado não "anda" durante a digitação.
    const description = this.add
      .dynamicBitmapText(centerX, 0, PixelFont.keyFor(900), menuText.description, PixelFont.sizeFor(DESCRIPTION_SCALE))
      .setMaxWidth(DESCRIPTION_MAX_WIDTH)
      .setCenterAlign()
      .setOrigin(0.5, 0);

    const stackHeight =
      TitlePlate.height + GAP_PLATE_TO_DESCRIPTION + description.height + GAP_DESCRIPTION_TO_BUTTON + SeraButton.height;
    const top = Math.round((height - stackHeight) / 2);

    const plate = new TitlePlate(this, {
      centerX,
      top,
      name: menuText.titleName,
      subtitle: menuText.titleSubtitle,
    });
    description.setY(top + TitlePlate.height + GAP_PLATE_TO_DESCRIPTION);
    const button = new SeraButton(this, {
      centerX,
      top: Math.round(description.y + description.height + GAP_DESCRIPTION_TO_BUTTON),
      label: menuText.startLabel,
      onPress: () => this.openPhaseSelect(),
    });

    return { plate, description, button };
  }

  private handleResize(): void {
    if (!this.leaving) {
      this.scene.restart();
    }
  }

  private playIntro(plate: TitlePlate, description: Phaser.GameObjects.DynamicBitmapText, button: SeraButton): void {
    const charCount = menuText.description.length;
    const typing = { revealed: 0 };
    description.setDisplayCallback((glyph) => {
      if (glyph.index >= Math.floor(typing.revealed)) {
        glyph.scale = 0;
      }
      return glyph;
    });

    plate.setVisible(false);
    plate.shadow.setVisible(false).setPosition(-TitlePlate.shadowOffset, -TitlePlate.shadowOffset);
    button.setScale(0);

    this.intro = gsap
      .timeline({ delay: INTRO.stampDelay })
      .set(plate, { visible: true })
      .from(plate, { scale: INTRO.stampFromScale, duration: INTRO.stampDuration, ease: 'power4.in' })
      .call(() => this.cameras.main.shake(INTRO.shakeMs, INTRO.shakeIntensity))
      .set(plate.shadow, { visible: true })
      .to(plate.shadow, { x: 0, y: 0, duration: INTRO.shadowDuration, ease: 'power2.out' })
      .addLabel('typing')
      .to(typing, { revealed: charCount, duration: charCount * INTRO.typingPerChar, ease: 'none' }, 'typing')
      .to(
        button,
        {
          scale: 1,
          duration: INTRO.buttonPopDuration,
          ease: 'back.out(2)',
          onComplete: () => button.startPulse(),
        },
        `typing+=${INTRO.buttonPopAfterTypingStart}`,
      );
  }

  private openPhaseSelect(): void {
    if (this.leaving) {
      return;
    }
    this.leaving = true;
    UiSound.click(this);
    // Fullscreen e lock pedem gesto do usuário; os dois falham em silêncio no iOS.
    if (!this.scale.isFullscreen) {
      this.scale.startFullscreen();
    }
    void screen.orientation?.lock?.('landscape').catch(() => undefined);
    this.scene.start('PhaseSelectScene');
  }
}
