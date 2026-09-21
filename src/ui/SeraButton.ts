/**
 * SeraButton — botão no estilo Sera do shadcn, tema neutral.
 *
 * Responsabilidade: desenhar o `Button` variante default (fundo `primary`
 * neutral-900, rótulo `primary-foreground` neutral-50, cantos retos, caixa alta com
 * tracking largo), reagir a hover e toque e, opcionalmente, pulsar para chamar o
 * toque. O `hover:bg-primary/80` vira um tom sólido equivalente, porque o jogo não
 * usa transparência.
 *
 * É um Container centrado no botão, para que escala (pulse, entrada) parta do meio.
 *
 * Referência: `apps/v4/registry/styles/style-sera.css` (shadcn), `.cn-button`;
 * `.agents/rules/art-pseudo-pixel-art.md`.
 */
import Phaser from 'phaser';
import { gsap } from 'gsap';
import { neutral } from '@/config/palette';
import { PixelFont } from '@/ui/PixelFont';

// Tamanho default do Sera (h-10, px-6, text-xs, tracking-widest,
// active:translate-y-px), convertido para a escala do jogo.
const HEIGHT = 64;
const PADDING_X = 40;
const LABEL_SCALE = 3;
const LABEL_TRACKING = 3; // tracking-widest ≈ 0.1em
const PRESS_OFFSET = 2;

const PULSE_SCALE = 1.06;
const PULSE_DURATION_S = 0.8;

type ButtonState = 'idle' | 'hover' | 'active';

export interface SeraButtonOptions {
  centerX: number;
  top: number;
  label: string;
  onPress: () => void;
}

export class SeraButton extends Phaser.GameObjects.Container {
  public static readonly height = HEIGHT;

  private readonly face: Phaser.GameObjects.Graphics;
  private readonly label: Phaser.GameObjects.BitmapText;
  private readonly faceWidth: number;
  private pulse: gsap.core.Tween | undefined;

  public constructor(scene: Phaser.Scene, { centerX, top, label, onPress }: SeraButtonOptions) {
    super(scene, centerX, top + HEIGHT / 2);

    this.label = scene.make
      .bitmapText({ font: PixelFont.keyFor(50), text: label.toUpperCase(), size: PixelFont.sizeFor(LABEL_SCALE) }, false)
      .setLetterSpacing(LABEL_TRACKING)
      .setOrigin(0.5);
    this.faceWidth = Math.round(this.label.width + PADDING_X * 2);
    this.face = scene.make.graphics({}, false);
    this.add([this.face, this.label]);
    this.render('idle');

    this.setSize(this.faceWidth, HEIGHT).setInteractive({ useHandCursor: true });
    this.bindPointer(onPress);
    scene.add.existing(this);
  }

  /** Pulso contínuo de escala. Pausa sozinho enquanto o botão está pressionado. */
  public startPulse(): void {
    this.pulse = gsap.to(this, {
      scale: PULSE_SCALE,
      duration: PULSE_DURATION_S,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  }

  public override destroy(fromScene?: boolean): void {
    this.pulse?.kill();
    this.pulse = undefined;
    super.destroy(fromScene);
  }

  private bindPointer(onPress: () => void): void {
    this.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => this.render('hover'));
    this.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
      // Com o dedo no botão o pulse para: o estado pressionado precisa ficar legível.
      this.pulse?.pause();
      this.setScale(1);
      this.render('active');
    });
    this.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
      this.render('idle');
      this.pulse?.resume();
    });
    this.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, onPress);
  }

  private render(state: ButtonState): void {
    const offset = state === 'active' ? PRESS_OFFSET : 0;
    this.face
      .clear()
      .fillStyle(state === 'idle' ? neutral.primary : neutral.primaryHover, 1)
      .fillRect(-this.faceWidth / 2, -HEIGHT / 2 + offset, this.faceWidth, HEIGHT);
    this.label.setY(offset);
  }
}
