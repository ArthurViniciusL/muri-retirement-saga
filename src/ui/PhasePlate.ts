import Phaser from 'phaser';
import { gsap } from 'gsap';
import { palette } from '@/config/palette';
import type { PhaseNumber, PhaseState } from '@/systems/PhaseProgress';
import { Motion } from '@/ui/Motion';
import { PixelFont } from '@/ui/PixelFont';
import { Woodcut, type Point, type Rect } from '@/ui/Woodcut';

const SIZE = 192;
const HALF = SIZE / 2;
const PLATE: Rect = { x: -HALF, y: -HALF, width: SIZE, height: SIZE };
const SHADOW_OFFSET = 12;
const NUMBER_SCALE = 12;

const HATCH = { spacing: 9, thickness: 2 } as const;
const CARVE = { belly: 3, jitter: 1, step: 40, overshootCorners: 2, overshoot: 6 } as const;
const GOUGES = { count: 8, minLength: 8, maxLength: 22, width: 4, minGap: 24 } as const;

const LOCKED_BORDER = 6;
const LOCKED_HATCH_INSET = 14;

const CHECK_NOTCH = { size: 48, inset: 10 } as const;
const NOTCH: Rect = {
  x: HALF - CHECK_NOTCH.inset - CHECK_NOTCH.size,
  y: -HALF + CHECK_NOTCH.inset,
  width: CHECK_NOTCH.size,
  height: CHECK_NOTCH.size,
};
const CHECK_SHAPE: readonly Point[] = [
  { x: 8, y: 24 },
  { x: 15, y: 17 },
  { x: 21, y: 24 },
  { x: 34, y: 9 },
  { x: 41, y: 16 },
  { x: 21, y: 38 },
];

const LOCK = {
  bodyWidth: 80,
  bodyHeight: 60,
  bodyOffsetY: 18, // o corpo desce para o conjunto (alça + corpo) ficar centrado
  shackleWidth: 52,
  shackleHeight: 38,
  shackleThickness: 12,
  keyholeRadius: 8,
  keyholeSlot: { width: 6, height: 16 },
  clearance: 8,
} as const;

const FOCUS = { gap: 12, thickness: 4 } as const;
const PULSE = { scale: 1.06, duration: 0.8 } as const;
const SHAKE = { distance: 6, stepDuration: 0.075, repeats: 3 } as const;

function inset(rect: Rect, by: number): Rect {
  return { x: rect.x + by, y: rect.y + by, width: rect.width - by * 2, height: rect.height - by * 2 };
}

export interface PhasePlateOptions {
  centerX: number;
  centerY: number;
  phase: PhaseNumber;
  state: PhaseState;
  onPress: () => void;
}

export class PhasePlate extends Phaser.GameObjects.Container {
  public static readonly size = SIZE;

  public readonly phase: PhaseNumber;
  public readonly phaseState: PhaseState;

  private readonly focusFrame: Phaser.GameObjects.Graphics;
  private readonly lock: Phaser.GameObjects.Graphics | undefined;
  private pulse: gsap.core.Tween | undefined;
  private shake: gsap.core.Tween | undefined;

  public constructor(scene: Phaser.Scene, { centerX, centerY, phase, state, onPress }: PhasePlateOptions) {
    super(scene, centerX, centerY);
    this.phase = phase;
    this.phaseState = state;

    this.focusFrame = this.drawFocusFrame();
    this.add(this.focusFrame);
    if (state === 'locked') {
      this.lock = this.drawLockedFace();
    } else {
      this.drawPrintedFace(state === 'completed');
    }

    this.setSize(SIZE, SIZE).setInteractive({ useHandCursor: true });
    this.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, onPress);
    scene.add.existing(this);
  }

  public setFocused(focused: boolean): this {
    this.focusFrame.setVisible(focused);
    return this;
  }

  public startPulse(): void {
    this.pulse = gsap.to(this, {
      scale: PULSE.scale,
      duration: PULSE.duration,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  }

  public shakeLock(): void {
    if (!this.lock || Motion.isReduced()) {
      return;
    }
    this.shake?.kill();
    this.shake = gsap.fromTo(
      this.lock,
      { x: -SHAKE.distance },
      {
        x: SHAKE.distance,
        duration: SHAKE.stepDuration,
        repeat: SHAKE.repeats,
        yoyo: true,
        ease: 'none',
        onComplete: () => this.lock?.setX(0),
      },
    );
  }

  public override destroy(fromScene?: boolean): void {
    this.pulse?.kill();
    this.shake?.kill();
    this.pulse = undefined;
    this.shake = undefined;
    super.destroy(fromScene);
  }

  private drawPrintedFace(completed: boolean): void {
    const carver = new Woodcut(`phase-plate-${this.phase}`);

    const shadow = this.scene.make.graphics({}, false);
    Woodcut.hatch(shadow, {
      area: { x: PLATE.x + SHADOW_OFFSET, y: PLATE.y + SHADOW_OFFSET, width: SIZE + 2, height: SIZE + 2 },
      ...HATCH,
      color: palette.sertao,
    });

    const mass = this.scene.make.graphics({}, false);
    mass.fillStyle(palette.ink, 1).fillPoints(carver.carvedRect(PLATE, CARVE), true);

    const number = this.scene.make
      .bitmapText(
        { font: PixelFont.keyFor('bone'), text: String(this.phase), size: PixelFont.sizeFor(NUMBER_SCALE) },
        false,
      )
      .setOrigin(0.5);

    const avoid = completed ? [PixelFont.letterBodyBounds(number), NOTCH] : [PixelFont.letterBodyBounds(number)];
    this.add([shadow, mass, this.carveGouges(carver, avoid), number]);
    if (completed) {
      this.add(this.drawCheck(carver));
    }
  }

  private carveGouges(carver: Woodcut, avoid: readonly Rect[]): Phaser.GameObjects.Graphics {
    const gouges = this.scene.make.graphics({}, false);
    gouges.fillStyle(palette.bone, 1);
    carver.gougeMarks(PLATE, { ...GOUGES, avoid }).forEach((mark) => gouges.fillPoints(mark, true));
    return gouges;
  }

  private drawCheck(carver: Woodcut): Phaser.GameObjects.Graphics {
    const check = this.scene.make.graphics({}, false);
    check
      .fillStyle(palette.bone, 1)
      .fillPoints(carver.carvedRect(NOTCH, { ...CARVE, belly: 1.5, step: 16, overshootCorners: 1, overshoot: 3 }), true)
      .fillStyle(palette.ink, 1)
      .fillPoints(
        CHECK_SHAPE.map((p) => ({ x: NOTCH.x + p.x, y: NOTCH.y + p.y })),
        true,
      );
    return check;
  }

  private drawLockedFace(): Phaser.GameObjects.Graphics {
    const carver = new Woodcut(`phase-plate-${this.phase}-locked`);

    const face = this.scene.make.graphics({}, false);
    face
      .fillStyle(palette.ink, 1)
      .fillPoints(carver.carvedRect(PLATE, CARVE), true)
      .fillStyle(palette.bone, 1)
      .fillPoints(carver.carvedRect(inset(PLATE, LOCKED_BORDER), { ...CARVE, belly: 2 }), true);
    Woodcut.hatch(face, { area: inset(PLATE, LOCKED_HATCH_INSET), ...HATCH, color: palette.clay });

    const lock = this.drawLock();
    this.add([face, lock]);
    return lock;
  }

  private drawLock(): Phaser.GameObjects.Graphics {
    const body = new Phaser.Geom.Rectangle(
      -LOCK.bodyWidth / 2,
      LOCK.bodyOffsetY - LOCK.bodyHeight / 2,
      LOCK.bodyWidth,
      LOCK.bodyHeight,
    );
    const shackle = new Phaser.Geom.Rectangle(
      -LOCK.shackleWidth / 2,
      body.y - LOCK.shackleHeight,
      LOCK.shackleWidth,
      LOCK.shackleHeight,
    );

    const lock = this.scene.make.graphics({}, false);
    this.clearPaperAround(lock, [body, shackle]);
    this.drawShackle(lock, shackle);
    lock.fillStyle(palette.ink, 1).fillRectShape(body);
    this.carveKeyhole(lock, body);
    return lock;
  }

  // Dois tons nunca se tocam sem contorno: a hachura não encosta no cadeado.
  private clearPaperAround(lock: Phaser.GameObjects.Graphics, parts: readonly Phaser.Geom.Rectangle[]): void {
    lock.fillStyle(palette.bone, 1);
    parts.forEach((part) => {
      const cleared = Phaser.Geom.Rectangle.Clone(part);
      Phaser.Geom.Rectangle.Inflate(cleared, LOCK.clearance, LOCK.clearance);
      lock.fillRectShape(cleared);
    });
  }

  private drawShackle(lock: Phaser.GameObjects.Graphics, shackle: Phaser.Geom.Rectangle): void {
    const thickness = LOCK.shackleThickness;
    lock
      .fillStyle(palette.ink, 1)
      .fillRect(shackle.x, shackle.y, thickness, shackle.height)
      .fillRect(shackle.right - thickness, shackle.y, thickness, shackle.height)
      .fillRect(shackle.x, shackle.y, shackle.width, thickness);
  }

  private carveKeyhole(lock: Phaser.GameObjects.Graphics, body: Phaser.Geom.Rectangle): void {
    const { keyholeRadius, keyholeSlot } = LOCK;
    const centerY = body.centerY - keyholeRadius / 2;
    lock
      .fillStyle(palette.bone, 1)
      .fillCircle(body.centerX, centerY, keyholeRadius)
      .fillRect(body.centerX - keyholeSlot.width / 2, centerY, keyholeSlot.width, keyholeSlot.height);
  }

  private drawFocusFrame(): Phaser.GameObjects.Graphics {
    const outer = HALF + FOCUS.gap + FOCUS.thickness;
    const length = outer * 2;
    const frame = this.scene.make.graphics({}, false);
    frame
      .fillStyle(palette.ink, 1)
      .fillRect(-outer, -outer, length, FOCUS.thickness)
      .fillRect(-outer, outer - FOCUS.thickness, length, FOCUS.thickness)
      .fillRect(-outer, -outer, FOCUS.thickness, length)
      .fillRect(outer - FOCUS.thickness, -outer, FOCUS.thickness, length);
    return frame.setVisible(false);
  }
}
