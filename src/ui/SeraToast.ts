import Phaser from 'phaser';
import { gsap } from 'gsap';
import { palette, sera } from '@/config/palette';
import { Motion } from '@/ui/Motion';
import { PixelFont } from '@/ui/PixelFont';
import { Woodcut } from '@/ui/Woodcut';

const HEIGHT = 56;
const PADDING_X = 24;
// Sonner no Sera: borda em tinta (`sera.primary`) em vez do token `border`, que some sobre o papel, e
// sombra hachurada no lugar do `shadow-lg`, porque o jogo não tem desfoque.
const BORDER = 2;
const LABEL_SCALE = 3;
const BOTTOM_MARGIN = 32;
const SHADOW = { offset: 8, spacing: 7, thickness: 2 } as const;

const VISIBLE_MS = 2500;
const SLIDE = { distance: 16, duration: 0.2 } as const;

export class SeraToast extends Phaser.GameObjects.Container {
  private readonly face: Phaser.GameObjects.Graphics;
  private readonly label: Phaser.GameObjects.BitmapText;
  private hideTimer: Phaser.Time.TimerEvent | undefined;
  private slide: gsap.core.Tween | undefined;

  public constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    this.face = scene.make.graphics({}, false);
    this.label = scene.make
      .bitmapText({ font: PixelFont.keyFor('ink'), text: '', size: PixelFont.sizeFor(LABEL_SCALE) }, false)
      .setOrigin(0.5);
    this.add([this.face, this.label]);
    this.setVisible(false);
    scene.add.existing(this);
  }

  public show(text: string): void {
    this.label.setText(text);
    this.drawFace(Math.round(this.label.width + PADDING_X * 2));
    this.placeAtBottomCenter().setVisible(true);
    this.slideIn();
    this.scheduleHide();
  }

  public override destroy(fromScene?: boolean): void {
    this.slide?.kill();
    this.hideTimer?.remove();
    this.slide = undefined;
    this.hideTimer = undefined;
    super.destroy(fromScene);
  }

  private placeAtBottomCenter(): this {
    const { width, height } = this.scene.scale.gameSize;
    return this.setPosition(Math.round(width / 2), Math.round(height - BOTTOM_MARGIN - HEIGHT / 2));
  }

  private slideIn(): void {
    this.slide?.kill();
    if (!Motion.isReduced()) {
      this.slide = gsap.from(this, { y: this.y + SLIDE.distance, duration: SLIDE.duration, ease: 'power2.out' });
    }
  }

  private scheduleHide(): void {
    this.hideTimer?.remove();
    this.hideTimer = this.scene.time.delayedCall(VISIBLE_MS, () => this.setVisible(false));
  }

  private drawFace(faceWidth: number): void {
    const left = -faceWidth / 2;
    const top = -HEIGHT / 2;
    this.face.clear();
    Woodcut.hatch(this.face, {
      area: { x: left + SHADOW.offset, y: top + SHADOW.offset, width: faceWidth, height: HEIGHT },
      spacing: SHADOW.spacing,
      thickness: SHADOW.thickness,
      color: palette.sertao,
    });
    this.face
      .fillStyle(sera.primary, 1)
      .fillRect(left, top, faceWidth, HEIGHT)
      .fillStyle(palette.bone, 1)
      .fillRect(left + BORDER, top + BORDER, faceWidth - BORDER * 2, HEIGHT - BORDER * 2);
  }
}
