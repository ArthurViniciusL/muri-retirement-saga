import type Phaser from 'phaser';
import { gameConfig } from '@/config/gameConfig';
import { zinc } from '@/config/palette';
import type { PuzzleThemeKey } from '@/config/phasesConfig';
import { ThemeTiles, TILE_PARTS, TILE_SIZE } from '@/systems/ThemeTiles';

export const textureKeys = {
  muri: 'muri_idle_01',
  parallaxFar: 'parallax_far',
  parallaxMid: 'parallax_mid',
  pause: 'ui_btn_pause',
  sun: 'sun',
  heartFull: 'ui_heart_full',
  heartEmpty: 'ui_heart_empty',
  cacti: ['cactus_001', 'cactus_002'],
} as const;

export type ControlButton = 'left' | 'right' | 'down' | 'jump' | 'melee' | 'ranged' | 'defend';

export function buttonTextureKey(button: ControlButton | 'pause', pressed: boolean): string {
  return pressed ? `ui_btn_${button}_pressed` : `ui_btn_${button}`;
}

type Painter = (graphics: Phaser.GameObjects.Graphics) => void;

const THEMES: readonly PuzzleThemeKey[] = ['instrumentos', 'xbox', 'moedas'];
const OUTLINE = 2;
const MURI = { width: 64, height: 96 };
const PARALLAX_WIDTH = 1024;

export class PlaceholderTextures {
  public static generate(scene: Phaser.Scene): void {
    const make = (key: string, width: number, height: number, paint: Painter): void => {
      if (scene.textures.exists(key)) {
        return;
      }
      const graphics = scene.make.graphics({}, false);
      paint(graphics);
      graphics.generateTexture(key, width, height);
      graphics.destroy();
    };

    make(textureKeys.muri, MURI.width, MURI.height, paintMuri);
    for (const theme of THEMES) {
      make(ThemeTiles.tilesetKey(theme), TILE_SIZE * TILE_PARTS.length, TILE_SIZE, paintTiles);
    }
    make(textureKeys.parallaxFar, PARALLAX_WIDTH, gameConfig.render.logicalHeight, paintFar);
    make(textureKeys.parallaxMid, PARALLAX_WIDTH, gameConfig.render.logicalHeight / 2, paintMid);

    const { buttonSize, pauseSize } = gameConfig.controls;
    for (const button of ['left', 'right', 'down', 'jump', 'melee', 'ranged', 'defend'] as const) {
      for (const pressed of [false, true]) {
        make(buttonTextureKey(button, pressed), buttonSize, buttonSize, (g) => paintButton(g, button, pressed));
      }
    }
    for (const pressed of [false, true]) {
      make(buttonTextureKey('pause', pressed), pauseSize, pauseSize, (g) => paintPause(g, pressed));
    }
  }
}

function outlinedRect(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, fill: number): void {
  g.fillStyle(zinc[950], 1).fillRect(x, y, w, h);
  g.fillStyle(fill, 1).fillRect(x + OUTLINE, y + OUTLINE, w - OUTLINE * 2, h - OUTLINE * 2);
}

function paintMuri(g: Phaser.GameObjects.Graphics): void {
  outlinedRect(g, 16, 0, 32, 36, zinc[300]);
  outlinedRect(g, 12, 34, 40, 62, zinc[600]);
  // Olho e nariz do lado direito: sem arte, é o que mostra para onde o Muri olha.
  g.fillStyle(zinc[950], 1).fillRect(38, 12, 6, 6).fillRect(48, 18, 8, 8);
}

function paintTiles(g: Phaser.GameObjects.Graphics): void {
  TILE_PARTS.forEach((part, index) => {
    const x = index * TILE_SIZE;
    outlinedRect(g, x, 0, TILE_SIZE, TILE_SIZE, zinc[800]);
    if (part !== 'mid') {
      g.fillStyle(zinc[950], 1).fillRect(x, 0, TILE_SIZE, 8);
    }
    if (part === 'left') {
      g.fillRect(x, 0, 8, TILE_SIZE);
    }
    if (part === 'right') {
      g.fillRect(x + TILE_SIZE - 8, 0, 8, TILE_SIZE);
    }
  });
}

function paintFar(g: Phaser.GameObjects.Graphics): void {
  const height = gameConfig.render.logicalHeight;
  g.fillStyle(zinc[100], 1).fillRect(0, 0, PARALLAX_WIDTH, height);
  g.fillStyle(zinc[200], 1);
  g.fillTriangle(-128, height, 256, 288, 640, height);
  g.fillTriangle(384, height, 832, 336, 1280, height);
  g.fillStyle(zinc[300], 1).fillRect(0, height - 64, PARALLAX_WIDTH, 64);
}

function paintMid(g: Phaser.GameObjects.Graphics): void {
  const height = gameConfig.render.logicalHeight / 2;
  g.fillStyle(zinc[400], 1);
  g.fillTriangle(0, height, 192, 64, 384, height);
  g.fillTriangle(320, height, 576, 128, 832, height);
  g.fillTriangle(704, height, 896, 32, 1088, height);
  g.fillTriangle(-64, height, 0, 96, 64, height);
  g.fillStyle(zinc[500], 1).fillRect(0, height - 48, PARALLAX_WIDTH, 48);
}

function paintButton(g: Phaser.GameObjects.Graphics, button: ControlButton, pressed: boolean): void {
  const size = gameConfig.controls.buttonSize;
  const c = size / 2;
  const ink = pressed ? zinc[50] : zinc[950];
  g.fillStyle(zinc[950], 1).fillCircle(c, c, c);
  g.fillStyle(pressed ? zinc[900] : zinc[50], 1).fillCircle(c, c, c - 4);
  g.fillStyle(ink, 1);
  switch (button) {
    case 'left':
      g.fillTriangle(c - 28, c, c + 20, c - 28, c + 20, c + 28);
      break;
    case 'right':
      g.fillTriangle(c + 28, c, c - 20, c - 28, c - 20, c + 28);
      break;
    case 'down':
      g.fillTriangle(c, c + 28, c - 28, c - 20, c + 28, c - 20);
      break;
    case 'jump':
      g.fillTriangle(c, c - 32, c - 32, c + 4, c + 32, c + 4);
      g.fillRect(c - 12, c + 4, 24, 24);
      break;
    case 'melee':
      g.fillRect(c - 28, c - 8, 56, 16);
      g.fillRect(c + 12, c - 20, 16, 40);
      break;
    case 'ranged':
      g.fillCircle(c + 16, c, 14);
      g.fillRect(c - 32, c - 4, 32, 8);
      break;
    case 'defend':
      g.fillRect(c - 24, c - 28, 48, 36);
      g.fillTriangle(c - 24, c + 8, c + 24, c + 8, c, c + 32);
      break;
  }
}

function paintPause(g: Phaser.GameObjects.Graphics, pressed: boolean): void {
  const size = gameConfig.controls.pauseSize;
  outlinedRect(g, 0, 0, size, size, pressed ? zinc[900] : zinc[50]);
  g.fillStyle(pressed ? zinc[50] : zinc[950], 1);
  g.fillRect(18, 16, 10, 32).fillRect(36, 16, 10, 32);
}
