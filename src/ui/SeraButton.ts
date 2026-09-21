import Phaser from 'phaser';
import { gsap } from 'gsap';
import { neutral, zinc } from '@/config/palette';
import { PixelFont } from '@/ui/PixelFont';

// Sera default (h-10, px-6, text-xs, tracking-widest, active:translate-y-px) na escala do jogo.
const HEIGHT = 64;
const PADDING_X = 40;
const LABEL_SCALE = 3;
const LABEL_TRACKING = 3; // tracking-widest ≈ 0.1em
const PRESS_OFFSET = 2;
// neutral-900 e não o token `border` (neutral-200) do Sera, que some sobre o papel.
const OUTLINE_BORDER = 2;

const PULSE_SCALE = 1.06;
const PULSE_DURATION_S = 0.8;

type ButtonState = 'idle' | 'hover' | 'active';
export type SeraButtonVariant = 'default' | 'outline';

export interface SeraButtonOptions {
  centerX: number;
  top: number;
  label: string;
  onPress: () => void;
  variant?: SeraButtonVariant;
}

export class SeraButton extends Phaser.GameObjects.Container {
  public static readonly height = HEIGHT;

  private readonly face: Phaser.GameObjects.Graphics;
  private readonly label: Phaser.GameObjects.BitmapText;
  private readonly faceWidth: number;
  private readonly variant: SeraButtonVariant;
  private pulse: gsap.core.Tween | undefined;

  public constructor(scene: Phaser.Scene, { centerX, top, label, onPress, variant = 'default' }: SeraButtonOptions) {
    super(scene, centerX, top + HEIGHT / 2);
    this.variant = variant;

    const labelTone = variant === 'outline' ? 900 : 50;
    this.label = scene.make
      .bitmapText({ font: PixelFont.keyFor(labelTone), text: label.toUpperCase(), size: PixelFont.sizeFor(LABEL_SCALE) }, false)
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
    const face = new Phaser.Geom.Rectangle(-this.faceWidth / 2, -HEIGHT / 2 + offset, this.faceWidth, HEIGHT);
    this.face.clear();
    if (this.variant === 'outline') {
      this.drawOutlineFace(face, state === 'idle' ? zinc[50] : neutral.muted);
    } else {
      this.drawSolidFace(face, state === 'idle' ? neutral.primary : neutral.primaryHover);
    }
    this.label.setY(offset);
  }

  private drawSolidFace(face: Phaser.Geom.Rectangle, fill: number): void {
    this.face.fillStyle(fill, 1).fillRectShape(face);
  }

  private drawOutlineFace(face: Phaser.Geom.Rectangle, fill: number): void {
    const inner = Phaser.Geom.Rectangle.Clone(face);
    Phaser.Geom.Rectangle.Inflate(inner, -OUTLINE_BORDER, -OUTLINE_BORDER);
    this.face.fillStyle(neutral.primary, 1).fillRectShape(face).fillStyle(fill, 1).fillRectShape(inner);
  }
}
