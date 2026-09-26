import type Phaser from 'phaser';
import { gameConfig } from '@/config/gameConfig';
import { palette } from '@/config/palette';

export type ControlButton = 'left' | 'right' | 'down' | 'jump' | 'melee' | 'ranged' | 'defend';

export const CONTROL_BUTTONS: readonly ControlButton[] = [
  'left',
  'right',
  'down',
  'jump',
  'melee',
  'ranged',
  'defend',
];

export function buttonTextureKey(button: ControlButton, pressed: boolean): string {
  return pressed ? `ui_btn_${button}_pressed` : `ui_btn_${button}`;
}

const RING = 4;

export class ControlTextures {
  public static generate(scene: Phaser.Scene): void {
    const { buttonSize } = gameConfig.controls;
    for (const button of CONTROL_BUTTONS) {
      for (const pressed of [false, true]) {
        const key = buttonTextureKey(button, pressed);
        if (scene.textures.exists(key)) {
          continue;
        }
        const graphics = scene.make.graphics({}, false);
        paintButton(graphics, button, pressed);
        graphics.generateTexture(key, buttonSize, buttonSize);
        graphics.destroy();
      }
    }
  }
}

function paintButton(graphics: Phaser.GameObjects.Graphics, button: ControlButton, pressed: boolean): void {
  const size = gameConfig.controls.buttonSize;
  const center = size / 2;
  const glyph = pressed ? palette.bone : palette.ink;

  graphics.fillStyle(palette.ink, 1).fillCircle(center, center, center);
  graphics.fillStyle(pressed ? palette.sertao : palette.bone, 1).fillCircle(center, center, center - RING);
  graphics.fillStyle(glyph, 1);

  switch (button) {
    case 'left':
      graphics.fillTriangle(center - 28, center, center + 20, center - 28, center + 20, center + 28);
      break;
    case 'right':
      graphics.fillTriangle(center + 28, center, center - 20, center - 28, center - 20, center + 28);
      break;
    case 'down':
      graphics.fillTriangle(center, center + 28, center - 28, center - 20, center + 28, center - 20);
      break;
    case 'jump':
      graphics.fillTriangle(center, center - 32, center - 32, center + 4, center + 32, center + 4);
      graphics.fillRect(center - 12, center + 4, 24, 24);
      break;
    case 'melee':
      graphics.fillRect(center - 28, center - 8, 56, 16);
      graphics.fillRect(center + 12, center - 20, 16, 40);
      break;
    case 'ranged':
      graphics.fillCircle(center + 16, center, 14);
      graphics.fillRect(center - 32, center - 4, 32, 8);
      break;
    case 'defend':
      graphics.fillRect(center - 24, center - 28, 48, 36);
      graphics.fillTriangle(center - 24, center + 8, center + 24, center + 8, center, center + 32);
      break;
  }
}
