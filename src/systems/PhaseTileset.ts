import type Phaser from 'phaser';
import { gameConfig } from '@/config/gameConfig';
import type { PhaseConfig, TileFamilyKey } from '@/config/phasesConfig';

interface Variant {
  top: boolean;
  left: boolean;
  right: boolean;
}

// Ordem das colunas do tileset: topo, meio, canto esquerdo, canto direito.
const VARIANTS: readonly Variant[] = [
  { top: true, left: false, right: false },
  { top: false, left: false, right: false },
  { top: true, left: true, right: false },
  { top: true, left: false, right: true },
];

function isDrawable(source: unknown): source is CanvasImageSource {
  return source instanceof HTMLImageElement || source instanceof HTMLCanvasElement;
}

export class PhaseTileset {
  /**
   * A arte de parede é um bloco único com contorno em volta; o tileset sai dela por
   * fatiamento, mantendo o contorno só nos lados que ficam expostos no mapa.
   */
  public static compose(scene: Phaser.Scene, config: PhaseConfig): void {
    const key = config.scenery.tilesetKey;
    if (scene.textures.exists(key)) {
      return;
    }

    const { tileSize } = gameConfig.scenery;
    const families: readonly TileFamilyKey[] = [config.scenery.groundTile, config.scenery.platformTile];

    const canvas = scene.textures.createCanvas(key, tileSize * VARIANTS.length * families.length, tileSize);
    if (canvas === null) {
      return;
    }

    families.forEach((family, familyIndex) => {
      VARIANTS.forEach((variant, variantIndex) => {
        PhaseTileset.drawCell(scene, canvas, family, variant, familyIndex * VARIANTS.length + variantIndex);
      });
    });
    canvas.refresh();
  }

  private static drawCell(
    scene: Phaser.Scene,
    canvas: Phaser.Textures.CanvasTexture,
    family: TileFamilyKey,
    variant: Variant,
    cell: number,
  ): void {
    const source = scene.textures.get(family).getSourceImage();
    if (!isDrawable(source)) {
      return;
    }

    const { tileSize, tileOutlineDisplayPx, sourcePaddingPx, sourceOutlinePx, sourceUpscale } = gameConfig.scenery;
    const upscale = sourceUpscale[family];
    const padding = sourcePaddingPx * upscale;
    const outline = sourceOutlinePx * upscale;

    const innerX = padding;
    const innerY = padding;
    const innerWidth = Number(source.width) - padding * 2;
    const innerHeight = Number(source.height) - padding * 2;

    const bodyX = innerX + outline;
    const bodyY = innerY + outline;
    const bodyWidth = innerWidth - outline * 2;
    const bodyHeight = innerHeight - outline * 2;

    const originX = cell * tileSize;
    const insetTop = variant.top ? tileOutlineDisplayPx : 0;
    const insetLeft = variant.left ? tileOutlineDisplayPx : 0;
    const insetRight = variant.right ? tileOutlineDisplayPx : 0;
    const innerCellWidth = tileSize - insetLeft - insetRight;

    const context = canvas.context;
    context.drawImage(
      source,
      bodyX,
      bodyY,
      bodyWidth,
      bodyHeight,
      originX + insetLeft,
      insetTop,
      innerCellWidth,
      tileSize - insetTop,
    );

    if (variant.top) {
      context.drawImage(
        source,
        bodyX,
        innerY,
        bodyWidth,
        outline,
        originX + insetLeft,
        0,
        innerCellWidth,
        tileOutlineDisplayPx,
      );
    }
    if (variant.left) {
      context.drawImage(source, innerX, innerY, outline, innerHeight, originX, 0, tileOutlineDisplayPx, tileSize);
    }
    if (variant.right) {
      context.drawImage(
        source,
        innerX + innerWidth - outline,
        innerY,
        outline,
        innerHeight,
        originX + tileSize - tileOutlineDisplayPx,
        0,
        tileOutlineDisplayPx,
        tileSize,
      );
    }
  }
}
