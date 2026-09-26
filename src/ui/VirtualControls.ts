import Phaser from 'phaser';
import { gameConfig } from '@/config/gameConfig';
import { buttonTextureKey, type ControlButton } from '@/systems/ControlTextures';

const DEPTH = 1000;
const DPAD: readonly ControlButton[] = ['left', 'down', 'right'];
// Grade 2×2: o pulo fica no canto de baixo, onde o polegar descansa.
const ACTIONS: readonly (readonly ControlButton[])[] = [
  ['ranged', 'defend'],
  ['melee', 'jump'],
];

export class VirtualControls {
  private readonly scene: Phaser.Scene;
  private readonly images = new Map<ControlButton, Phaser.GameObjects.Image>();
  private readonly pointers = new Map<number, ControlButton | null>();
  private readonly pressedSinceRead = new Set<ControlButton>();
  private visible: boolean;

  public constructor(scene: Phaser.Scene) {
    this.scene = scene;
    for (const button of [...DPAD, ...ACTIONS.flat()]) {
      const image = scene.add.image(0, 0, buttonTextureKey(button, false)).setScrollFactor(0).setDepth(DEPTH);
      this.images.set(button, image);
    }
    this.visible = scene.sys.game.device.input.touch;
    this.applyVisibility();
    this.layout();

    scene.input.addPointer(3);
    scene.input.on(Phaser.Input.Events.POINTER_DOWN, this.handleDown, this);
    scene.input.on(Phaser.Input.Events.POINTER_MOVE, this.handleMove, this);
    scene.input.on(Phaser.Input.Events.POINTER_UP, this.handleUp, this);
    scene.input.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, this.handleUp, this);
  }

  public isHeld(button: ControlButton): boolean {
    for (const held of this.pointers.values()) {
      if (held === button) {
        return true;
      }
    }
    return false;
  }

  public consumePressed(button: ControlButton): boolean {
    return this.pressedSinceRead.delete(button);
  }

  public releaseAll(): void {
    this.pointers.clear();
    this.pressedSinceRead.clear();
    this.refreshTextures();
  }

  public layout(): void {
    const { width, height } = this.scene.scale.gameSize;
    const { margin, buttonSize, buttonGap } = gameConfig.controls;
    const step = buttonSize + buttonGap;
    const half = buttonSize / 2;

    DPAD.forEach((button, index) => {
      this.images.get(button)?.setPosition(margin + half + index * step, height - margin - half);
    });
    const columns = ACTIONS[0]?.length ?? 0;
    ACTIONS.forEach((row, rowIndex) => {
      row.forEach((button, columnIndex) => {
        const x = width - margin - half - (columns - 1 - columnIndex) * step;
        const y = height - margin - half - (ACTIONS.length - 1 - rowIndex) * step;
        this.images.get(button)?.setPosition(x, y);
      });
    });
  }

  private handleDown(pointer: Phaser.Input.Pointer): void {
    if (pointer.wasTouch && !this.visible) {
      this.visible = true;
      this.applyVisibility();
      return;
    }
    this.track(pointer);
  }

  private handleMove(pointer: Phaser.Input.Pointer): void {
    if (pointer.isDown && this.pointers.has(pointer.id)) {
      this.track(pointer);
    }
  }

  private handleUp(pointer: Phaser.Input.Pointer): void {
    this.pointers.delete(pointer.id);
    this.refreshTextures();
  }

  private track(pointer: Phaser.Input.Pointer): void {
    const button = this.visible ? (this.buttonAt(pointer.x, pointer.y) ?? null) : null;
    const previous = this.pointers.get(pointer.id) ?? null;
    // Dedo fora de botão continua rastreado: deslizar de volta pressiona de novo.
    this.pointers.set(pointer.id, button);
    if (button !== null && button !== previous) {
      this.pressedSinceRead.add(button);
    }
    this.refreshTextures();
  }

  private buttonAt(x: number, y: number): ControlButton | undefined {
    const radius = gameConfig.controls.buttonHitRadius;
    let nearest: ControlButton | undefined;
    let nearestDistance: number = radius;
    for (const [button, image] of this.images) {
      const distance = Phaser.Math.Distance.Between(x, y, image.x, image.y);
      if (distance <= nearestDistance) {
        nearest = button;
        nearestDistance = distance;
      }
    }
    return nearest;
  }

  private applyVisibility(): void {
    for (const image of this.images.values()) {
      image.setVisible(this.visible);
    }
  }

  private refreshTextures(): void {
    for (const [button, image] of this.images) {
      image.setTexture(buttonTextureKey(button, this.isHeld(button)));
    }
  }
}
