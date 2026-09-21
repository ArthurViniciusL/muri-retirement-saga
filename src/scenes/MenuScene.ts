/**
 * MenuScene — tela inicial do jogo.
 *
 * Responsabilidade: apresentar a abertura de "Muri Retirement Saga" e iniciar a
 * progressão linear a partir da Fase 1.
 *
 * Composição "capa de folheto de cordel": a matriz de xilogravura com o título
 * (`TitlePlate`), a descrição em tinta e o botão "Iniciar" (`SeraButton`),
 * empilhados e centralizados. A faixa `start_menu` toca em loop (`MenuMusic`).
 *
 * Entrada animada com GSAP, como uma impressão: a matriz é carimbada no papel, a
 * sombra escorre por baixo, a descrição é datilografada e o botão salta e passa a
 * pulsar. Nada usa opacidade — tudo aparece por escala, posição ou visibilidade.
 * Com "reduzir movimento", a tela abre pronta e o botão não pulsa.
 *
 * Referência: System Design §3 (Arquitetura de cenas), §17 (Fluxo de jogo);
 * `.agents/rules/ui-orientation-fullscreen.md`.
 */
import Phaser from 'phaser';
import { gsap } from 'gsap';
import { menuText } from '@/data/menuText';
import { MenuMusic } from '@/systems/MenuMusic';
import { PixelFont } from '@/ui/PixelFont';
import { SeraButton } from '@/ui/SeraButton';
import { TitlePlate } from '@/ui/TitlePlate';

const DESCRIPTION_SCALE = 3;
const DESCRIPTION_MAX_WIDTH = TitlePlate.width;
const GAP_PLATE_TO_DESCRIPTION = 36;
const GAP_DESCRIPTION_TO_BUTTON = 36;

/** Tempos da entrada, em segundos (unidade do GSAP), exceto o tremor. */
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

/**
 * A entrada roda uma vez por carga. Girar o aparelho reinicia a cena para refazer o
 * layout, e repetir o carimbo a cada giro seria ruído.
 */
let introPlayed = false;

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export class MenuScene extends Phaser.Scene {
  private started = false;
  private intro: gsap.core.Timeline | undefined;

  public constructor() {
    super('MenuScene');
  }

  public create(): void {
    this.started = false;
    const { plate, description, button } = this.layout();

    if (!prefersReducedMotion()) {
      if (introPlayed) {
        button.startPulse();
      } else {
        this.playIntro(plate, description, button);
      }
    }
    introPlayed = true;

    MenuMusic.start(this, () => !this.started);
    this.input.keyboard?.on('keydown-ENTER', () => this.startGame());
    this.input.keyboard?.on('keydown-SPACE', () => this.startGame());

    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize, this);
      this.intro?.kill();
      this.intro = undefined;
    });
  }

  /** Placa, descrição e botão empilhados e centralizados na tela. */
  private layout(): { plate: TitlePlate; description: Phaser.GameObjects.DynamicBitmapText; button: SeraButton } {
    const { width, height } = this.scale.gameSize;
    const centerX = Math.round(width / 2);

    // A descrição define a altura do conjunto, então é medida antes de posicionar.
    // `DynamicBitmapText` permite esconder letra por letra sem refazer a quebra de
    // linha — a digitação não faz o texto centralizado "andar".
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
      onPress: () => this.startGame(),
    });

    return { plate, description, button };
  }

  private handleResize(): void {
    if (!this.started) {
      this.scene.restart();
    }
  }

  /**
   * Linha do tempo da entrada: carimbo da matriz, sombra, datilografia e o botão
   * saltando no meio da digitação, para o convidado não precisar esperar o texto.
   */
  private playIntro(plate: TitlePlate, description: Phaser.GameObjects.DynamicBitmapText, button: SeraButton): void {
    const charCount = menuText.description.length;
    const typing = { revealed: 0 };
    description.setDisplayCallback((glyph) => {
      // Só letras inteiras: a próxima aparece de uma vez, como numa máquina de escrever.
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

  private startGame(): void {
    if (this.started) {
      return;
    }
    this.started = true;
    MenuMusic.stop();
    // Fullscreen e lock pedem gesto do usuário; os dois falham em silêncio no iOS.
    this.scale.startFullscreen();
    void screen.orientation?.lock?.('landscape').catch(() => undefined);
    this.scene.start('Phase1Scene');
  }
}
