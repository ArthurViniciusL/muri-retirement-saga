import type Phaser from 'phaser';
import type { PuzzleThemeKey } from '@/config/phasesConfig';

// A ordem define o id de cada tile no tileset e precisa bater com tools/level/*.py.
export const TILE_PARTS = ['top', 'mid', 'left', 'right'] as const;
export const TILE_SIZE = 64;

type TilePart = (typeof TILE_PARTS)[number];

const tileUrls = import.meta.glob<string>('../assets/sprites/tiles/*/tile_*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

function partKey(theme: PuzzleThemeKey, part: TilePart): string {
  return `tile_${theme}_${part}`;
}

function urlOf(theme: PuzzleThemeKey, part: TilePart): string | undefined {
  return tileUrls[`../assets/sprites/tiles/${theme}/${partKey(theme, part)}.png`];
}

export class ThemeTiles {
  public static tilesetKey(theme: PuzzleThemeKey): string {
    return `tiles_${theme}`;
  }

  public static preload(loader: Phaser.Loader.LoaderPlugin, theme: PuzzleThemeKey): void {
    for (const part of TILE_PARTS) {
      const url = urlOf(theme, part);
      if (url !== undefined) {
        loader.image(partKey(theme, part), url);
      }
    }
  }

  // O tileset do Phaser lê uma imagem só; os quatro PNGs viram uma faixa em memória.
  public static compose(scene: Phaser.Scene, theme: PuzzleThemeKey): void {
    const key = ThemeTiles.tilesetKey(theme);
    if (scene.textures.exists(key)) {
      return;
    }
    const images = TILE_PARTS.map((part) => partKey(theme, part))
      .filter((part) => scene.textures.exists(part))
      .map((part) => scene.textures.get(part).getSourceImage())
      .filter((source): source is HTMLImageElement => source instanceof HTMLImageElement);
    if (images.length !== TILE_PARTS.length) {
      return;
    }
    const strip = scene.textures.createCanvas(key, TILE_SIZE * TILE_PARTS.length, TILE_SIZE);
    images.forEach((image, index) => strip?.context.drawImage(image, index * TILE_SIZE, 0));
    strip?.refresh();
  }
}
